/**
 * Core type definitions for the GIGS platform
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the application, ensuring type safety and consistency.
 */

import type { 
  User as PrismaUser,
  WorkerProfile,
  EmployerProfile,
  JobPosting,
  Booking,
  Invoice,
  Payout,
  AvailabilitySlot,
  Role,
  JobStatus,
  BookingStatus,
  InvoiceStatus,
  PayoutStatus
} from '@prisma/client';

/**
 * Enhanced user type with profile information
 */
export interface User extends PrismaUser {
  workerProfile?: WorkerProfile & {
    availability: AvailabilitySlot[];
    bookings: Booking[];
  };
  employerProfile?: EmployerProfile & {
    jobs: JobPosting[];
  };
}

/**
 * Complete job posting with related data
 */
export interface JobWithDetails extends JobPosting {
  employer: EmployerProfile & {
    user: PrismaUser;
  };
  bookings: (Booking & {
    worker: WorkerProfile & {
      user: PrismaUser;
    };
  })[];
  _count?: {
    bookings: number;
  };
}

/**
 * Worker availability slot with enhanced information
 */
export interface AvailabilityWithLocation extends AvailabilitySlot {
  worker: WorkerProfile & {
    user: PrismaUser;
  };
}

/**
 * Geographic location interface
 */
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Search filters for job postings
 */
export interface JobSearchFilters {
  location?: string;
  radius?: number;
  roles?: string[];
  minRate?: number;
  maxRate?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: JobStatus[];
}

/**
 * Search filters for workers
 */
export interface WorkerSearchFilters {
  location?: string;
  radius?: number;
  skills?: string[];
  minRate?: number;
  maxRate?: number;
  availability?: {
    start: Date;
    end: Date;
  };
}

/**
 * Dashboard statistics for employers
 */
export interface EmployerDashboardStats {
  activeJobs: number;
  totalBookings: number;
  pendingInvoices: number;
  totalSpent: number;
}

/**
 * Dashboard statistics for workers
 */
export interface WorkerDashboardStats {
  activeBookings: number;
  completedJobs: number;
  pendingPayouts: number;
  totalEarned: number;
}

// Legacy interfaces for backward compatibility (to be removed in future versions)
export interface LegacyUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  phone?: string;
  location?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegacyEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: JobStatus;
  budget: number;
  organizerId: string;
  staffNeeded: number;
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LegacyGig {
  id: string;
  eventId: string;
  title: string;
  description: string;
  hourlyRate: number;
  hoursRequired: number;
  requirements: string[];
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegacyApplication {
  id: string;
  gigId: string;
  staffId: string;
  coverLetter: string;
  proposedRate?: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form data interfaces for type-safe form handling
 */
export interface CreateJobFormData {
  title: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  start: Date;
  end: Date;
  neededRoles: string[];
  headcount: number;
  rate: number;
}

export interface CreateWorkerProfileFormData {
  skills: string[];
  minRate: number;
  maxRate: number;
  radiusKm: number;
  homeLat: number;
  homeLng: number;
}

export interface CreateEmployerProfileFormData {
  company: string;
  website?: string;
}

export interface AvailabilityFormData {
  start: Date;
  end: Date;
  rolesOk: string[];
  minRate: number;
}

export interface BookingApplicationFormData {
  jobId: string;
  coverMessage?: string;
}

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Legacy form types (to be removed)
export interface CreateEventFormData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  staffNeeded: number;
  requirements: string[];
}

export interface CreateGigFormData {
  eventId: string;
  title: string;
  description: string;
  hourlyRate: number;
  hoursRequired: number;
  requirements: string[];
}