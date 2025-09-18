/**
 * Utility functions for the GIGS platform
 * 
 * This file contains reusable utility functions used throughout the application
 * for common operations like styling, formatting, and calculations.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges CSS class names using clsx and tailwind-merge
 * 
 * @param inputs - CSS class names to combine
 * @returns {string} Merged CSS class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (USD)
 * 
 * @param amount - The amount to format
 * @param showCents - Whether to show cents (default: true)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(25) // "$25.00"
 * formatCurrency(25, false) // "$25"
 */
export function formatCurrency(amount: number, showCents: boolean = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

/**
 * Formats a date range into a readable string
 * 
 * @param start - Start date
 * @param end - End date
 * @returns {string} Formatted date range string
 * 
 * @example
 * formatDateRange(new Date('2024-01-15'), new Date('2024-01-16'))
 * // "Jan 15, 2024 - Jan 16, 2024"
 */
export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  
  const startFormatted = start.toLocaleDateString('en-US', options);
  const endFormatted = end.toLocaleDateString('en-US', options);
  
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Formats a date and time into a readable string
 * 
 * @param date - Date to format
 * @param includeTime - Whether to include time (default: true)
 * @returns {string} Formatted date string
 */
export function formatDateTime(date: Date, includeTime: boolean = true): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime && {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }),
  };
  
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculates the duration between two dates in hours
 * 
 * @param start - Start date
 * @param end - End date
 * @returns {number} Duration in hours
 */
export function calculateDurationHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculates the total payment for a job based on rate and duration
 * 
 * @param hourlyRate - Hourly rate in dollars
 * @param start - Start date/time
 * @param end - End date/time
 * @returns {number} Total payment amount
 */
export function calculateJobPayment(hourlyRate: number, start: Date, end: Date): number {
  const hours = calculateDurationHours(start, end);
  return Math.round(hourlyRate * hours * 100) / 100; // Round to 2 decimal places
}

/**
 * Generates initials from a full name
 * 
 * @param name - Full name
 * @returns {string} Initials (up to 2 characters)
 * 
 * @example
 * generateInitials("John Doe") // "JD"
 * generateInitials("Jane") // "J"
 */
export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Truncates text to a specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Validates if a string is a valid CUID
 * 
 * @param id - String to validate
 * @returns {boolean} True if valid CUID
 */
export function isValidCuid(id: string): boolean {
  const cuidRegex = /^c[a-z0-9]{24}$/i;
  return cuidRegex.test(id);
}

/**
 * Debounces a function call
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculates distance between two geographic points using Haversine formula
 * 
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}