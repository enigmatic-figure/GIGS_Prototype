export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { createUserSchema } from "@/lib/schemas";

function buildRateLimitHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

export async function POST(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `users:${identifier}`, limit: 10, windowMs: 60_000 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many requests. Please wait before trying again." },
      { status: 429, headers: buildRateLimitHeaders(limit) }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for /api/users", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: buildRateLimitHeaders(limit) }
    );
  }

  const parsed = createUserSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: buildRateLimitHeaders(limit) }
    );
  }

  const data = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 409, headers: buildRateLimitHeaders(limit) }
      );
    }

    const created = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        workerProfile:
          data.role === "WORKER" && data.workerProfile
            ? {
                create: {
                  ...data.workerProfile,
                  availability: {
                    create: [],
                  },
                },
              }
            : undefined,
        employerProfile:
          data.role === "EMPLOYER" && data.employerProfile
            ? {
                create: data.employerProfile,
              }
            : undefined,
      },
      include: {
        workerProfile: true,
        employerProfile: true,
      },
    });

    return NextResponse.json(
      { message: "User created", user: created },
      { status: 201, headers: buildRateLimitHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json(
      { message: "Failed to create user." },
      { status: 500, headers: buildRateLimitHeaders(limit) }
    );
  }
}
