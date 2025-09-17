import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { updateWorkerProfileSchema } from "@/lib/schemas";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `workers:get:${identifier}`, limit: 60 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  try {
    const worker = await prisma.workerProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        availability: { orderBy: { start: "asc" } },
        bookings: {
          orderBy: { createdAt: "desc" },
          include: {
            job: {
              include: {
                employer: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    if (!worker) {
      return NextResponse.json(
        { message: "Worker not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    return NextResponse.json(
      { worker },
      { headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to load worker", error);
    return NextResponse.json(
      { message: "Failed to load worker." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `workers:patch:${identifier}`, limit: 30 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for PATCH /api/workers/:id", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = updateWorkerProfileSchema.safeParse({
    ...(payload as Record<string, unknown>),
    workerId: params.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  try {
    const updated = await prisma.workerProfile.update({
      where: { id: params.id },
      data: {
        skills: parsed.data.skills,
        minRate: parsed.data.minRate,
        maxRate: parsed.data.maxRate,
        radiusKm: parsed.data.radiusKm,
        homeLat: parsed.data.homeLat,
        homeLng: parsed.data.homeLng,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      { message: "Worker updated", worker: updated },
      { headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to update worker", error);
    return NextResponse.json(
      { message: "Failed to update worker." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
