import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { BOOKING_STATUS, JOB_STATUS } from "@/lib/constants";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { updateBookingSchema } from "@/lib/schemas";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

async function syncJobStatus(jobId: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { bookings: true },
  });

  if (!job) {
    return;
  }

  const accepted = job.bookings.filter(
    (booking) => booking.status === BOOKING_STATUS.ACCEPTED
  ).length;
  const offered = job.bookings.filter(
    (booking) => booking.status === BOOKING_STATUS.OFFERED
  ).length;

  let nextStatus = JOB_STATUS.OPEN;
  if (accepted >= job.headcount) {
    nextStatus = JOB_STATUS.FILLED;
  } else if (accepted > 0 || offered > 0) {
    nextStatus = JOB_STATUS.PARTIALLY_FILLED;
  }

  if (nextStatus !== job.status) {
    await prisma.jobPosting.update({
      where: { id: job.id },
      data: { status: nextStatus },
    });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        job: {
          include: {
            employer: { include: { user: true } },
            bookings: true,
          },
        },
        worker: {
          include: { user: true },
        },
      },
    });

    await syncJobStatus(booking.jobId);

    return NextResponse.json(
      { message: "Booking updated", booking },
      { headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to update booking", error);
    return NextResponse.json(
      { message: "Failed to update booking." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
