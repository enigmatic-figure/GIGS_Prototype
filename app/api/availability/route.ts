export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import {
  availabilityQuerySchema,
  createAvailabilitySchema,
  deleteAvailabilitySchema,
} from "@/lib/schemas";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

export async function GET(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `availability:get:${identifier}`, limit: 60 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many availability requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  const url = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({ workerId: url.searchParams.get("workerId") });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "workerId is required", errors: parsed.error.flatten() },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  try {
    const slots = await prisma.availabilitySlot.findMany({
      where: { workerId: parsed.data.workerId },
      orderBy: { start: "asc" },
    });

    return NextResponse.json({ availability: slots }, { headers: rateHeaders(limit) });
  } catch (error) {
    console.error("Failed to fetch availability", error);
    return NextResponse.json(
      { message: "Failed to load availability." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}

export async function POST(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `availability:post:${identifier}`, limit: 20 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests. Please slow down." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for /api/availability", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = createAvailabilitySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  const data = parsed.data;

  try {
    const worker = await prisma.workerProfile.findUnique({ where: { id: data.workerId } });
    if (!worker) {
      return NextResponse.json(
        { message: "Worker not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    const created = await prisma.availabilitySlot.create({
      data: {
        workerId: data.workerId,
        start: data.start,
        end: data.end,
        rolesOk: data.rolesOk,
        minRate: data.minRate,
      },
    });

    return NextResponse.json(
      { message: "Availability slot created", availability: created },
      { status: 201, headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to create availability slot", error);
    return NextResponse.json(
      { message: "Failed to create availability slot." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}

export async function DELETE(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `availability:delete:${identifier}`, limit: 20 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const parsed = deleteAvailabilitySchema.safeParse({ id });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid availability id", errors: parsed.error.flatten() },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  try {
    await prisma.availabilitySlot.delete({ where: { id: parsed.data.id } });

    return NextResponse.json(
      { message: "Availability slot removed" },
      { headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to delete availability slot", error);
    return NextResponse.json(
      { message: "Failed to delete availability slot." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
