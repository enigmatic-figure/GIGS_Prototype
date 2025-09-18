export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { writeEmailStub } from "@/lib/email";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { createBookingSchema } from "@/lib/schemas";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

export async function POST(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `bookings:post:${identifier}`, limit: 30 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many booking operations." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for /api/bookings", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = createBookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  try {
    const [job, worker] = await Promise.all([
      prisma.jobPosting.findUnique({ where: { id: parsed.data.jobId }, include: { employer: { include: { user: true } } } }),
      prisma.workerProfile.findUnique({ where: { id: parsed.data.workerId }, include: { user: true } }),
    ]);

    if (!job) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    if (!worker) {
      return NextResponse.json(
        { message: "Worker not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    const existing = await prisma.booking.findFirst({
      where: { jobId: job.id, workerId: worker.id },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Booking already exists for this worker.", booking: existing },
        { status: 200, headers: rateHeaders(limit) }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        jobId: job.id,
        workerId: worker.id,
        status: BOOKING_STATUS.OFFERED,
      },
    });

    console.log("📨 Booking offer created", {
      jobId: job.id,
      workerId: worker.id,
      bookingId: booking.id,
    });

    const workerName = worker.user?.name ?? "there";
    const email = worker.user?.email ?? "no-email@gigs.test";
    const subject = `Offer: ${job.title}`;
    const body = `Hi ${workerName},\n\n${job.employer?.company ?? "A client"} has sent you an offer for ${job.title}.\n` +
      `The job starts on ${job.start.toUTCString()} at $${job.rate}/hr.`;

    let emailStubPath: string | null = null;
    try {
      emailStubPath = await writeEmailStub({ to: email, subject, body });
      console.log("📧 Offer email stub recorded", { emailStubPath });
    } catch (error) {
      console.error("Failed to write offer email stub", error);
    }

    return NextResponse.json(
      { message: "Booking created", booking, emailStubPath },
      { status: 201, headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to create booking", error);
    return NextResponse.json(
      { message: "Failed to create booking." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
