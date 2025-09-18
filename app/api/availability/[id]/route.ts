export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { deleteAvailabilitySchema } from "@/lib/schemas";

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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `availability:delete:${identifier}`, limit: 30 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many delete operations." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  const parsed = deleteAvailabilitySchema.safeParse({ id: params.id });
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid availability id", errors: parsed.error.flatten() },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  try {
    await prisma.availabilitySlot.delete({ where: { id: parsed.data.id } });
    return NextResponse.json(
      { message: "Availability slot deleted" },
      { status: 200, headers: rateHeaders(limit) }
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Availability slot not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    console.error("Failed to delete availability slot", error);
    return NextResponse.json(
      { message: "Failed to delete availability slot." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
