import { describe, expect, it } from "vitest";

import {
  calculateAvailabilityCoverage,
  hasAnyOverlap,
  overlapHours,
  type TimeRange,
} from "@/lib/timeOverlap";

describe("time overlap utilities", () => {
  const baseRange: TimeRange = {
    start: new Date("2024-01-01T10:00:00Z"),
    end: new Date("2024-01-01T18:00:00Z"),
  };

  it("calculates overlapping hours between two ranges", () => {
    const other: TimeRange = {
      start: new Date("2024-01-01T12:00:00Z"),
      end: new Date("2024-01-01T16:00:00Z"),
    };

    expect(overlapHours(baseRange, other)).toBe(4);
  });

  it("returns zero overlap when ranges do not intersect", () => {
    const other: TimeRange = {
      start: new Date("2024-01-01T20:00:00Z"),
      end: new Date("2024-01-01T22:00:00Z"),
    };

    expect(overlapHours(baseRange, other)).toBe(0);
  });

  it("computes total availability coverage", () => {
    const ranges: TimeRange[] = [
      { start: new Date("2024-01-01T09:00:00Z"), end: new Date("2024-01-01T13:00:00Z") },
      { start: new Date("2024-01-01T15:00:00Z"), end: new Date("2024-01-01T19:00:00Z") },
    ];

    const result = calculateAvailabilityCoverage(baseRange, ranges);

    expect(result.overlapHours).toBeCloseTo(6);
    expect(result.coverageRatio).toBeCloseTo(0.75);
  });

  it("detects whether any overlap exists", () => {
    const ranges: TimeRange[] = [
      { start: new Date("2024-01-01T00:00:00Z"), end: new Date("2024-01-01T01:00:00Z") },
      { start: new Date("2024-01-01T23:00:00Z"), end: new Date("2024-01-02T02:00:00Z") },
    ];

    expect(hasAnyOverlap(baseRange, ranges)).toBe(false);
    ranges.push({ start: new Date("2024-01-01T17:00:00Z"), end: new Date("2024-01-01T21:00:00Z") });
    expect(hasAnyOverlap(baseRange, ranges)).toBe(true);
  });
});
