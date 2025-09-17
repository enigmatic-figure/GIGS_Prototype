import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { createJobPostingSchema, jobFiltersSchema } from "@/lib/schemas";

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

export async function GET(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `jobs:get:${identifier}`, limit: 60 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  const url = new URL(request.url);
  const parsed = jobFiltersSchema.safeParse({ employerId: url.searchParams.get("employerId") ?? undefined });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid filters", errors: parsed.error.flatten() },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  try {
    const jobs = await prisma.jobPosting.findMany({
      where: parsed.data.employerId ? { employerId: parsed.data.employerId } : undefined,
      include: {
        employer: true,
        bookings: true,
      },
      orderBy: { start: "asc" },
    });

    return NextResponse.json({ jobs }, { headers: rateHeaders(limit) });
  } catch (error) {
    console.error("Failed to fetch jobs", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}

export async function POST(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `jobs:post:${identifier}`, limit: 20 });

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
    console.error("Invalid JSON payload for /api/jobs", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = createJobPostingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  const data = parsed.data;

  try {
    const employer = await prisma.employerProfile.findUnique({ where: { id: data.employerId } });
    if (!employer) {
      return NextResponse.json(
        { message: "Employer not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    const created = await prisma.jobPosting.create({
      data: {
        employerId: data.employerId,
        title: data.title,
        description: data.description,
        location: data.location,
        lat: data.lat,
        lng: data.lng,
        start: data.start,
        end: data.end,
        neededRoles: data.neededRoles,
        headcount: data.headcount,
        rate: data.rate,
      },
      include: {
        employer: true,
      },
    });

    return NextResponse.json(
      { message: "Job created", job: created },
      { status: 201, headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to create job", error);
    return NextResponse.json(
      { message: "Failed to create job." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
