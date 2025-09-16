import { z } from 'zod';

// User validation schemas
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(5, 'Location must be specified'),
  startDate: z.date().min(new Date(), 'Start date must be in the future'),
  endDate: z.date(),
  budget: z.number().min(50, 'Budget must be at least $50'),
  staffNeeded: z.number().min(1, 'At least 1 staff member is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Gig validation schemas
export const createGigSchema = z.object({
  eventId: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  hourlyRate: z.number().min(15, 'Hourly rate must be at least $15'),
  hoursRequired: z.number().min(1, 'At least 1 hour is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
});

// Application validation schemas
export const createApplicationSchema = z.object({
  gigId: z.string(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  proposedRate: z.number().optional(),
});

// Authentication schemas
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['organizer', 'staff']),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});