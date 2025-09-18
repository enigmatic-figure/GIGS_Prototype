export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { PAYOUT_STATUS } from "@/lib/constants";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { createPayoutSchema } from "@/lib/schemas";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

export async function POST(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `payouts:post:${identifier}`, limit: 20 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many payout operations." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for /api/payouts", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = createPayoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parsed.data.bookingId },
      include: {
        job: true,
        worker: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    const durationHours = Math.max(1, (booking.job.end.getTime() - booking.job.start.getTime()) / (1000 * 60 * 60));
    const amountCents = Math.round(booking.job.rate * durationHours * 100);

    const existing = await prisma.payout.findFirst({
      where: { bookingId: booking.id },
    });

    let payout;
    if (existing) {
      payout = await prisma.payout.update({
        where: { id: existing.id },
        data: {
          amountCents,
          status: existing.status === PAYOUT_STATUS.PAID ? PAYOUT_STATUS.PAID : PAYOUT_STATUS.PENDING,
        },
      });
    } else {
      payout = await prisma.payout.create({
        data: {
          bookingId: booking.id,
          workerId: booking.workerId,
          amountCents,
          status: PAYOUT_STATUS.PENDING,
        },
      });
    }

    console.log("💸 Payout processed", {
      payoutId: payout.id,
      bookingId: booking.id,
      workerId: booking.workerId,
      amountCents: payout.amountCents,
      status: payout.status,
    });

    return NextResponse.json(
      { message: "Payout processed", payout },
      { status: existing ? 200 : 201, headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to process payout", error);
    return NextResponse.json(
      { message: "Failed to process payout." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
