// Core type definitions for the GIGS platform

export type UserRole = 'organizer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  budget: number;
  organizerId: string;
  staffNeeded: number;
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Gig {
  id: string;
  eventId: string;
  title: string;
  description: string;
  hourlyRate: number;
  hoursRequired: number;
  requirements: string[];
  status: 'open' | 'filled' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  gigId: string;
  staffId: string;
  coverLetter: string;
  proposedRate?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

// Form types
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