import { describe, expect, it } from "vitest";

import { haversineDistance } from "@/lib/haversine";
import { rankWorkersForJob, scoreWorkerForJob, type JobForMatching, type WorkerForMatching } from "@/lib/matching";

const job: JobForMatching = {
  id: "job_1",
  neededRoles: ["Usher", "FOH"],
  rate: 25,
  start: new Date("2024-02-01T12:00:00Z"),
  end: new Date("2024-02-01T20:00:00Z"),
  location: { lat: 40.7128, lng: -74.006 },
};

const baseWorker: WorkerForMatching = {
  id: "worker_1",
  name: "Alex",
  skills: ["Usher", "Ticketing"],
  minRate: 20,
  maxRate: 30,
  radiusKm: 50,
  homeLat: 40.7306,
  homeLng: -73.9352,
  availability: [
    { start: new Date("2024-02-01T10:00:00Z"), end: new Date("2024-02-01T22:00:00Z") },
  ],
};

describe("matching score", () => {
  it("favors workers whose skills and rate align", () => {
    const score = scoreWorkerForJob(job, baseWorker);
    expect(score.skillOverlap).toBeCloseTo(0.5);
    expect(score.rateFit).toBe(1);
    expect(score.availabilityCoverage).toBeCloseTo(1);
    expect(score.finalScore).toBeGreaterThan(0.6);
  });

  it("penalizes workers outside the preferred rate range", () => {
    const expensiveWorker: WorkerForMatching = {
      ...baseWorker,
      id: "worker_expensive",
      minRate: 40,
      maxRate: 60,
    };

    const baseline = scoreWorkerForJob(job, baseWorker);
    const score = scoreWorkerForJob(job, expensiveWorker);
    expect(score.rateFit).toBeLessThan(1);
    expect(score.rateFit).toBeCloseTo(0.75);
    expect(score.finalScore).toBeLessThan(baseline.finalScore);
  });

  it("ranks the best candidate first", () => {
    const nearWorker: WorkerForMatching = {
      ...baseWorker,
      id: "worker_near",
      homeLat: 40.713,
      homeLng: -74.0059,
    };

    const farWorker: WorkerForMatching = {
      ...baseWorker,
      id: "worker_far",
      homeLat: 41.0,
      homeLng: -75.0,
    };

    const ranked = rankWorkersForJob(job, [farWorker, nearWorker, baseWorker]);
    expect(ranked).toHaveLength(3);
    expect(ranked[0]?.workerId).toBe("worker_near");
    expect(ranked[2]?.workerId).toBe("worker_far");
  });

  it("uses haversine distance for proximity", () => {
    const distance = haversineDistance(job.location!, { lat: baseWorker.homeLat, lng: baseWorker.homeLng });
    expect(distance).toBeGreaterThan(0);
  });
});
