import { notFound } from "next/navigation";

import { CandidateSuggestions } from "@/components/employer/candidate-suggestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/database";
import { rankWorkersForJob } from "@/lib/matching";

async function getJob(jobId: string) {
  return prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      employer: { include: { user: true } },
      bookings: true,
    },
  });
}

async function getWorkers() {
  return prisma.workerProfile.findMany({
    include: {
      user: true,
      availability: true,
    },
  });
}

type PageProps = {
  params: { jobId: string };
};

export default async function EmployerCandidatesPage({ params }: PageProps) {
  const job = await getJob(params.jobId);

  if (!job) {
    notFound();
  }

  const workers = await getWorkers();

  const jobForMatching = {
    id: job.id,
    neededRoles: job.neededRoles,
    rate: job.rate,
    start: job.start,
    end: job.end,
    location:
      job.lat != null && job.lng != null
        ? { lat: job.lat, lng: job.lng }
        : null,
  } as const;

  const workerForMatching = workers.map((worker) => ({
    id: worker.id,
    name: worker.user?.name ?? worker.user?.email ?? null,
    skills: worker.skills,
    minRate: worker.minRate,
    maxRate: worker.maxRate,
    radiusKm: worker.radiusKm,
    homeLat: worker.homeLat,
    homeLng: worker.homeLng,
    availability: worker.availability.map((slot) => ({ start: slot.start, end: slot.end })),
  }));

  const scores = rankWorkersForJob(jobForMatching, workerForMatching)
    .filter((score) => score.skillOverlap > 0 && score.availabilityCoverage > 0)
    .slice(0, 12);

  const suggestions = scores.map((score) => {
    const worker = workers.find((candidate) => candidate.id === score.workerId)!;
    return {
      workerId: worker.id,
      workerName: worker.user?.name ?? worker.user?.email ?? "Worker",
      workerEmail: worker.user?.email ?? null,
      skills: worker.skills,
      minRate: worker.minRate,
      maxRate: worker.maxRate,
      distanceKm: score.distanceKm,
      metrics: {
        finalScore: score.finalScore,
        skillOverlap: score.skillOverlap,
        rateFit: score.rateFit,
        availabilityCoverage: score.availabilityCoverage,
        overlapHours: score.overlapHours,
        distanceScore: score.distanceScore,
      },
      availabilityPreview: worker.availability
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(0, 3)
        .map((slot) => ({
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          rolesOk: slot.rolesOk,
          minRate: slot.minRate,
        })),
    };
  });

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Candidate recommendations</h1>
        <p className="text-sm text-muted-foreground">
          Based on skills, availability, rates, and commute distance for {job.title}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job context</CardTitle>
          <CardDescription>
            {job.location} • {job.neededRoles.join(", ")} at ${job.rate}/hr • {job.headcount} workers needed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Invite top matches. Workers already invited or confirmed are weighted higher in search results.
        </CardContent>
      </Card>

      <CandidateSuggestions jobId={job.id} suggestions={suggestions} />
    </div>
  );
}
