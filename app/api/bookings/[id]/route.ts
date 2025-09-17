import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { writeEmailStub } from "@/lib/email";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { updateBookingSchema } from "@/lib/schemas";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

function isRecordNotFoundError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `bookings:patch:${identifier}`, limit: 40 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many booking updates." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for PATCH /api/bookings/:id", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = updateBookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  try {
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      include: {
        job: { include: { employer: { include: { user: true } } } },
        worker: { include: { user: true } },
      },
    });

    console.log("🔄 Booking status updated", {
      bookingId: booking.id,
      status: booking.status,
      jobId: booking.jobId,
      workerId: booking.workerId,
    });

    let emailStubPath: string | null = null;

    if (booking.status === BOOKING_STATUS.ACCEPTED || booking.status === BOOKING_STATUS.DECLINED) {
      const employerEmail = booking.job.employer?.user?.email ?? "no-email@gigs.test";
      const employerName = booking.job.employer?.user?.name ?? "team";
      const workerName = booking.worker.user?.name ?? "A worker";
      const subject = `Booking ${booking.status} - ${booking.job.title}`;
      const body = `Hi ${employerName},\n\n${workerName} has ${booking.status.toLowerCase()} the offer for ${booking.job.title}.`;

      try {
        emailStubPath = await writeEmailStub({ to: employerEmail, subject, body });
        console.log("📧 Status email stub recorded", { emailStubPath });
      } catch (error) {
        console.error("Failed to write booking status email stub", error);
      }
    }

    return NextResponse.json(
      { message: "Booking updated", booking, emailStubPath },
      { headers: rateHeaders(limit) }
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    console.error("Failed to update booking", error);
    return NextResponse.json(
      { message: "Failed to update booking." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
