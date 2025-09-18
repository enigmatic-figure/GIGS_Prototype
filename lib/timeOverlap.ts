/**
 * Utilities for reasoning about overlapping time ranges.
 */

export type TimeRange = {
  start: Date;
  end: Date;
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Calculates the overlap duration in hours between two time ranges.
 */
export function overlapHours(a: TimeRange, b: TimeRange): number {
  const start = Math.max(toDate(a.start).getTime(), toDate(b.start).getTime());
  const end = Math.min(toDate(a.end).getTime(), toDate(b.end).getTime());

  const diff = end - start;
  if (diff <= 0) {
    return 0;
  }

  return diff / (1000 * 60 * 60);
}

/**
 * Aggregates the overlap between a base range and a collection of availability ranges.
 *
 * @param base - The base time window that needs coverage (e.g. job start/end).
 * @param ranges - Availability ranges to compare against.
 * @returns Total overlap hours and the coverage ratio relative to the base duration.
 */
export function calculateAvailabilityCoverage(base: TimeRange, ranges: TimeRange[]): {
  overlapHours: number;
  coverageRatio: number;
} {
  const baseDurationHours = Math.max(
    0,
    (toDate(base.end).getTime() - toDate(base.start).getTime()) / (1000 * 60 * 60)
  );

  if (baseDurationHours <= 0) {
    return { overlapHours: 0, coverageRatio: 0 };
  }

  const total = ranges.reduce((acc, range) => acc + overlapHours(base, range), 0);
  const cappedTotal = Math.min(total, baseDurationHours);

  return {
    overlapHours: cappedTotal,
    coverageRatio: Math.min(1, cappedTotal / baseDurationHours),
  };
}

/**
 * Determines whether any of the provided availability windows overlaps the base window.
 */
export function hasAnyOverlap(base: TimeRange, ranges: TimeRange[]): boolean {
  return ranges.some(range => overlapHours(base, range) > 0);
}
