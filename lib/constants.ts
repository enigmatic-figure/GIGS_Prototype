// App-wide constants
export const APP_CONFIG = {
  name: 'GIGS',
  description: 'On-Demand Event Staffing Marketplace',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '0.1.0',
} as const;

// User roles
export const USER_ROLES = {
  ORGANIZER: 'organizer',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

// Event statuses
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Application statuses
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;