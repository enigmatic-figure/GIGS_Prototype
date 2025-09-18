/**
 * Validation schemas for the GIGS platform
 * 
 * This file contains all Zod validation schemas used throughout the application
 * for form validation, API request validation, and data integrity.
 */

import { z } from 'zod';
import { LIMITS, STAFF_ROLES } from './constants';

/**
 * User profile validation schemas
 */
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().min(5, 'Location must be at least 5 characters'),
});

/**
 * Job posting validation schemas
 */
export const createJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(5, 'Location must be specified'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  start: z.date().min(new Date(), 'Start time must be in the future'),
  end: z.date(),
  neededRoles: z.array(z.enum(STAFF_ROLES))
    .min(1, 'At least one role is required'),
  headcount: z.number().min(1, 'At least 1 person is required').max(100),
  rate: z.number()
    .min(LIMITS.MIN_HOURLY_RATE, `Rate must be at least $${LIMITS.MIN_HOURLY_RATE}`)
    .max(LIMITS.MAX_HOURLY_RATE, `Rate cannot exceed $${LIMITS.MAX_HOURLY_RATE}`),
}).refine((data) => data.end > data.start, {
  message: 'End time must be after start time',
  path: ['end'],
}).refine((data) => {
  const durationHours = (data.end.getTime() - data.start.getTime()) / (1000 * 60 * 60);
  return durationHours >= LIMITS.MIN_JOB_DURATION_HOURS && durationHours <= LIMITS.MAX_JOB_DURATION_HOURS;
}, {
  message: `Job duration must be between ${LIMITS.MIN_JOB_DURATION_HOURS} and ${LIMITS.MAX_JOB_DURATION_HOURS} hours`,
  path: ['end'],
});

/**
 * Worker profile validation schemas
 */
export const createWorkerProfileSchema = z.object({
  skills: z.array(z.enum(STAFF_ROLES))
    .min(1, 'At least one skill is required'),
  minRate: z.number()
    .min(LIMITS.MIN_HOURLY_RATE, `Minimum rate must be at least $${LIMITS.MIN_HOURLY_RATE}`),
  maxRate: z.number()
    .max(LIMITS.MAX_HOURLY_RATE, `Maximum rate cannot exceed $${LIMITS.MAX_HOURLY_RATE}`),
  radiusKm: z.number()
    .min(LIMITS.MIN_RADIUS_KM, `Radius must be at least ${LIMITS.MIN_RADIUS_KM}km`)
    .max(LIMITS.MAX_RADIUS_KM, `Radius cannot exceed ${LIMITS.MAX_RADIUS_KM}km`),
  homeLat: z.number().min(-90).max(90),
  homeLng: z.number().min(-180).max(180),
}).refine((data) => data.maxRate >= data.minRate, {
  message: 'Maximum rate must be greater than or equal to minimum rate',
  path: ['maxRate'],
});

/**
 * Employer profile validation schemas
 */
export const createEmployerProfileSchema = z.object({
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
});

/**
 * Availability slot validation schemas
 */
export const availabilitySlotSchema = z.object({
  start: z.date().min(new Date(), 'Availability must be in the future'),
  end: z.date(),
  rolesOk: z.array(z.enum(STAFF_ROLES))
    .min(1, 'At least one role must be selected'),
  minRate: z.number()
    .min(LIMITS.MIN_HOURLY_RATE, `Rate must be at least $${LIMITS.MIN_HOURLY_RATE}`),
}).refine((data) => data.end > data.start, {
  message: 'End time must be after start time',
  path: ['end'],
});

/**
 * Booking application validation schemas
 */
export const bookingApplicationSchema = z.object({
  jobId: z.string().cuid('Invalid job ID'),
  coverMessage: z.string().min(10, 'Cover message must be at least 10 characters').optional(),
});

/**
 * Search and filtering validation schemas
 */
export const jobSearchSchema = z.object({
  location: z.string().optional(),
  radius: z.number().min(1).max(100).optional(),
  roles: z.array(z.enum(STAFF_ROLES)).optional(),
  minRate: z.number().min(LIMITS.MIN_HOURLY_RATE).optional(),
  maxRate: z.number().max(LIMITS.MAX_HOURLY_RATE).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const workerSearchSchema = z.object({
  location: z.string().optional(),
  radius: z.number().min(1).max(100).optional(),
  skills: z.array(z.enum(STAFF_ROLES)).optional(),
  minRate: z.number().min(LIMITS.MIN_HOURLY_RATE).optional(),
  maxRate: z.number().max(LIMITS.MAX_HOURLY_RATE).optional(),
  availableFrom: z.date().optional(),
  availableTo: z.date().optional(),
});

/**
 * Authentication validation schemas
 */
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['WORKER', 'EMPLOYER']),
  phone: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * API pagination validation schema
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Legacy schemas (to be removed in future versions)
export const createEventSchema = createJobSchema;
export const createGigSchema = z.object({
  eventId: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  hourlyRate: z.number().min(15, 'Hourly rate must be at least $15'),
  hoursRequired: z.number().min(1, 'At least 1 hour is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
});

export const createApplicationSchema = z.object({
  gigId: z.string(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  proposedRate: z.number().optional(),
});