import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { updateJobStatusSchema } from "@/lib/schemas";

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `jobs:get:${identifier}`, limit: 60 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  const jobId = params.id;

  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        employer: true,
        bookings: {
          include: {
            worker: { include: { user: true } },
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    return NextResponse.json({ job }, { headers: rateHeaders(limit) });
  } catch (error) {
    console.error("Failed to load job", error);
    return NextResponse.json(
      { message: "Failed to load job." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `jobs:patch:${identifier}`, limit: 30 });

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
    console.error("Invalid JSON payload for PATCH /api/jobs/:id", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = updateJobStatusSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  try {
    const updated = await prisma.jobPosting.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json(
      { message: "Job updated", job: updated },
      { headers: rateHeaders(limit) }
    );
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    console.error("Failed to update job", error);
    return NextResponse.json(
      { message: "Failed to update job." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
