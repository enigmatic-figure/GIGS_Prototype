import { haversineDistance } from "./haversine";
import { calculateAvailabilityCoverage, type TimeRange } from "./timeOverlap";

export type JobForMatching = {
  id: string;
  neededRoles: string[];
  rate: number;
  start: Date;
  end: Date;
  location?: {
    lat: number;
    lng: number;
  } | null;
};

export type WorkerAvailability = TimeRange;

export type WorkerForMatching = {
  id: string;
  name?: string | null;
  skills: string[];
  minRate: number;
  maxRate: number;
  radiusKm: number;
  homeLat: number;
  homeLng: number;
  availability: WorkerAvailability[];
};

export type WorkerMatchScore = {
  workerId: string;
  workerName?: string | null;
  skillOverlap: number;
  rateFit: number;
  distanceScore: number;
  availabilityCoverage: number;
  overlapHours: number;
  distanceKm: number | null;
  finalScore: number;
};

function computeRateFit(jobRate: number, workerMin: number, workerMax: number): number {
  if (workerMax < workerMin) {
    [workerMin, workerMax] = [workerMax, workerMin];
  }

  if (jobRate >= workerMin && jobRate <= workerMax) {
    return 1;
  }

  const diff = jobRate < workerMin ? workerMin - jobRate : jobRate - workerMax;
  const normaliser = Math.max(workerMax, workerMin, jobRate, 1);
  return Math.max(0, 1 - diff / normaliser);
}

function computeDistanceScore(
  job: JobForMatching,
  worker: WorkerForMatching
): { distanceKm: number | null; score: number } {
  if (!job.location) {
    return { distanceKm: null, score: 0.5 };
  }

  const { lat, lng } = job.location;
  const distance = haversineDistance(
    { lat, lng },
    { lat: worker.homeLat, lng: worker.homeLng }
  );

  if (!Number.isFinite(worker.radiusKm) || worker.radiusKm <= 0) {
    return { distanceKm: distance, score: 0 };
  }

  if (distance > worker.radiusKm) {
    return { distanceKm: distance, score: 0 };
  }

  const score = Math.max(0, 1 - distance / worker.radiusKm);
  return { distanceKm: distance, score };
}

export function scoreWorkerForJob(job: JobForMatching, worker: WorkerForMatching): WorkerMatchScore {
  const jobRoles = new Set(job.neededRoles);
  const matchedSkillCount = worker.skills.filter((skill) => jobRoles.has(skill)).length;
  const skillOverlap = jobRoles.size === 0 ? 0 : matchedSkillCount / jobRoles.size;

  const availability = calculateAvailabilityCoverage(
    { start: job.start, end: job.end },
    worker.availability
  );

  const rateFit = computeRateFit(job.rate, worker.minRate, worker.maxRate);
  const distance = computeDistanceScore(job, worker);

  const weights = {
    skill: 0.4,
    availability: 0.3,
    rate: 0.2,
    distance: 0.1,
  } as const;

  const finalScore =
    skillOverlap * weights.skill +
    availability.coverageRatio * weights.availability +
    rateFit * weights.rate +
    distance.score * weights.distance;

  return {
    workerId: worker.id,
    workerName: worker.name,
    skillOverlap,
    rateFit,
    distanceScore: distance.score,
    availabilityCoverage: availability.coverageRatio,
    overlapHours: availability.overlapHours,
    distanceKm: distance.distanceKm,
    finalScore: Number(finalScore.toFixed(4)),
  };
}

export function rankWorkersForJob(job: JobForMatching, workers: WorkerForMatching[]): WorkerMatchScore[] {
  return workers
    .map((worker) => scoreWorkerForJob(job, worker))
    .sort((a, b) => b.finalScore - a.finalScore);
}
