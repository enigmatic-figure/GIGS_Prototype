import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { writeEmailStub } from "@/lib/email";
import { isWithinRadius } from "@/lib/haversine";
import { rankWorkersForJob, type WorkerForMatching } from "@/lib/matching";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { matchRequestSchema } from "@/lib/schemas";
import { calculateAvailabilityCoverage } from "@/lib/timeOverlap";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

type WorkerWithRelations = {
  id: string;
  skills: string[];
  minRate: number;
  maxRate: number;
  radiusKm: number;
  homeLat: number;
  homeLng: number;
  availability: Array<{ start: Date; end: Date; rolesOk: string[]; minRate: number }>;
  user: { name: string | null; email: string | null } | null;
};

type JobWithRelations = {
  id: string;
  neededRoles: string[];
  rate: number;
  start: Date;
  end: Date;
  lat: number | null;
  lng: number | null;
  title: string;
  description: string;
  location: string;
  employerId: string;
  employer: { user: { name: string | null; email: string | null } | null } | null;
  bookings: Array<{ workerId: string }>;
};

export async function POST(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `match:${identifier}`, limit: 12, windowMs: 60_000 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many matching requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for /api/match", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = matchRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  try {
    const job = (await prisma.jobPosting.findUnique({
      where: { id: parsed.data.jobId },
      include: {
        employer: { include: { user: true } },
        bookings: true,
      },
    })) as JobWithRelations | null;

    if (!job) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    const workers = (await prisma.workerProfile.findMany({
      include: {
        user: true,
        availability: true,
      },
    })) as WorkerWithRelations[];

    const jobLocation =
      job.lat != null && job.lng != null
        ? { lat: job.lat, lng: job.lng }
        : null;

    const jobRange = { start: job.start, end: job.end };
    const bookedWorkerIds = new Set(job.bookings.map((booking) => booking.workerId));

    const eligibleWorkers = workers.filter((worker) => {
      if (!worker.skills.some((skill: string) => job.neededRoles.includes(skill))) {
        return false;
      }

      if (job.rate < worker.minRate || job.rate > worker.maxRate) {
        return false;
      }

      if (
        jobLocation &&
        !isWithinRadius(
          { lat: worker.homeLat, lng: worker.homeLng },
          jobLocation,
          worker.radiusKm
        )
      ) {
        return false;
      }

      if (bookedWorkerIds.has(worker.id) && worker.id !== parsed.data.inviteWorkerId) {
        return false;
      }

      const coverage = calculateAvailabilityCoverage(
        jobRange,
        worker.availability.map((slot) => ({ start: slot.start, end: slot.end }))
      );
      return coverage.overlapHours > 0;
    });

    const matchingWorkers: WorkerForMatching[] = eligibleWorkers.map((worker) => ({
      id: worker.id,
      name: worker.user?.name,
      skills: worker.skills,
      minRate: worker.minRate,
      maxRate: worker.maxRate,
      radiusKm: worker.radiusKm,
      homeLat: worker.homeLat,
      homeLng: worker.homeLng,
      availability: worker.availability.map((slot) => ({ start: slot.start, end: slot.end })),
    }));

    const workerMap = new Map<string, WorkerWithRelations>(
      eligibleWorkers.map((worker) => [worker.id, worker])
    );

    const jobForMatching = {
      id: job.id,
      neededRoles: job.neededRoles,
      rate: job.rate,
      start: job.start,
      end: job.end,
      location: jobLocation,
    };

    const ranked = rankWorkersForJob(jobForMatching, matchingWorkers)
      .filter((score) => score.skillOverlap > 0 && score.availabilityCoverage > 0)
      .slice(0, 20);

    const suggestions = ranked.map((score) => {
      const worker = workerMap.get(score.workerId)!;
      return {
        workerId: score.workerId,
        workerName: worker.user?.name ?? worker.user?.email ?? "Unknown worker",
        workerEmail: worker.user?.email ?? null,
        skills: worker.skills,
        minRate: worker.minRate,
        maxRate: worker.maxRate,
        distanceKm: score.distanceKm,
        metrics: {
          finalScore: score.finalScore,
          skillOverlap: score.skillOverlap,
          rateFit: score.rateFit,
          distanceScore: score.distanceScore,
          availabilityCoverage: score.availabilityCoverage,
          overlapHours: score.overlapHours,
        },
        availabilityPreview: worker.availability
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .slice(0, 3)
          .map((slot) => ({
            start: slot.start,
            end: slot.end,
            rolesOk: slot.rolesOk,
            minRate: slot.minRate,
          })),
      };
    });

    let inviteResult: { bookingId: string; emailStubPath: string | null } | null = null;

    if (parsed.data.inviteWorkerId) {
      const workerProfile = workerMap.get(parsed.data.inviteWorkerId);

      if (!workerProfile) {
        return NextResponse.json(
          { message: "Worker not found for invitation." },
          { status: 404, headers: rateHeaders(limit) }
        );
      }

      let booking = await prisma.booking.findFirst({
        where: { jobId: job.id, workerId: workerProfile.id },
      });

      if (booking) {
        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: { status: BOOKING_STATUS.OFFERED },
        });
      } else {
        booking = await prisma.booking.create({
          data: {
            jobId: job.id,
            workerId: workerProfile.id,
            status: BOOKING_STATUS.OFFERED,
          },
        });
      }

      console.log("📨 Booking offer created", {
        jobId: job.id,
        workerId: workerProfile.id,
        bookingId: booking.id,
      });

      const workerName = workerProfile.user?.name ?? "there";
      const email = workerProfile.user?.email ?? "no-email@gigs.test";
      const subject = `Offer: ${job.title}`;
      const body = `Hi ${workerName},\n\nYou're invited to work ${job.title} on ${job.start.toUTCString()}.\n` +
        `Rate: $${job.rate}/hr. Log in to your dashboard to accept or decline.`;

      let emailStubPath: string | null = null;
      try {
        emailStubPath = await writeEmailStub({ to: email, subject, body });
        console.log("📧 Offer email stub recorded", { emailStubPath });
      } catch (error) {
        console.error("Failed to write offer email stub", error);
      }

      inviteResult = { bookingId: booking.id, emailStubPath };
    }

    return NextResponse.json(
      {
        jobId: job.id,
        suggestions,
        invited: inviteResult,
      },
      { headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to run matching", error);
    return NextResponse.json(
      { message: "Failed to generate matches." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
