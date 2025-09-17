/**
 * Application-wide constants and configuration values
 * 
 * This file centralizes all constant values used throughout the application
 * to ensure consistency and easy maintenance.
 */

/**
 * Core application configuration
 */
export const APP_CONFIG = {
  name: 'GIGS',
  description: 'On-Demand Event Staffing Marketplace',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '1.0.0-mvp',
  supportEmail: 'support@gigs.com',
} as const;

/**
 * User roles within the platform
 */
export const USER_ROLES = {
  WORKER: 'WORKER',
  EMPLOYER: 'EMPLOYER',
  ADMIN: 'admin',
} as const;

/**
 * Job posting statuses
 */
export const JOB_STATUS = {
  OPEN: 'OPEN',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * Booking statuses for worker-job assignments
 */
export const BOOKING_STATUS = {
  OFFERED: 'OFFERED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

/**
 * Payment and invoice statuses
 */
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  VOID: 'VOID',
} as const;

export const PAYOUT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
} as const;

/**
 * Common event staff roles and skills
 */
export const STAFF_ROLES = [
  'Stagehand',
  'Setup/Teardown',
  'Usher',
  'FOH', // Front of House
  'Ticketing',
  'Concessions',
  'Runner',
  'Security',
  'Technical Support',
  'VIP Host',
] as const;

/**
 * Rate limits and constraints
 */
export const LIMITS = {
  MIN_HOURLY_RATE: 15,
  MAX_HOURLY_RATE: 100,
  MAX_RADIUS_KM: 100,
  MIN_RADIUS_KM: 5,
  MAX_JOB_DURATION_HOURS: 24,
  MIN_JOB_DURATION_HOURS: 1,
} as const;