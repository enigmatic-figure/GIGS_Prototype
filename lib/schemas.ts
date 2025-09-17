import { z } from "zod";
import { BOOKING_STATUS, JOB_STATUS, LIMITS, STAFF_ROLES } from "./constants";

const cuid = () => z.string().cuid("Invalid identifier");

const skillEnum = z.enum(STAFF_ROLES as [string, ...string[]]);

const workerProfileInputSchema = z
  .object({
    skills: z.array(skillEnum).min(1),
    minRate: z.number().min(LIMITS.MIN_HOURLY_RATE),
    maxRate: z.number().max(LIMITS.MAX_HOURLY_RATE),
    radiusKm: z.number().min(LIMITS.MIN_RADIUS_KM).max(LIMITS.MAX_RADIUS_KM),
    homeLat: z.number().min(-90).max(90),
    homeLng: z.number().min(-180).max(180),
  })
  .refine((data) => data.maxRate >= data.minRate, {
    message: "maxRate must be greater than or equal to minRate",
    path: ["maxRate"],
  });

export const createUserSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(["WORKER", "EMPLOYER"]),
    workerProfile: workerProfileInputSchema.optional(),
    employerProfile: z
      .object({
        company: z.string().min(2),
        website: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "WORKER" && !data.workerProfile) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["workerProfile"], message: "Worker profile is required" });
    }
    if (data.role === "EMPLOYER" && !data.employerProfile) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["employerProfile"], message: "Employer profile is required" });
    }
  });

export const availabilityQuerySchema = z.object({
  workerId: cuid(),
});

export const createAvailabilitySchema = z.object({
  workerId: cuid(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  rolesOk: z.array(skillEnum).min(1),
  minRate: z.number().min(LIMITS.MIN_HOURLY_RATE).max(LIMITS.MAX_HOURLY_RATE),
});

export const deleteAvailabilitySchema = z.object({
  id: cuid(),
});

export const jobFiltersSchema = z.object({
  employerId: cuid().optional(),
});

export const createJobPostingSchema = z
  .object({
    employerId: cuid(),
    title: z.string().min(5),
    description: z.string().min(20),
    location: z.string().min(3),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    start: z.coerce.date(),
    end: z.coerce.date(),
    neededRoles: z.array(skillEnum).min(1),
    headcount: z.number().min(1),
    rate: z.number().min(LIMITS.MIN_HOURLY_RATE).max(LIMITS.MAX_HOURLY_RATE),
  })
  .refine((data) => data.end > data.start, {
    message: "End time must be after start time",
    path: ["end"],
  });

export const updateJobStatusSchema = z.object({
  status: z.enum(Object.values(JOB_STATUS) as [string, ...string[]]),
});

export const matchRequestSchema = z.object({
  jobId: cuid(),
  inviteWorkerId: cuid().optional(),
});

export const createBookingSchema = z.object({
  jobId: cuid(),
  workerId: cuid(),
});

export const updateBookingSchema = z.object({
  status: z.enum(Object.values(BOOKING_STATUS) as [string, ...string[]]),
});

export const createInvoiceSchema = z.object({
  jobId: cuid(),
});

export const createPayoutSchema = z.object({
  bookingId: cuid(),
});
