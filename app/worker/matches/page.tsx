import { notFound } from "next/navigation";
import Link from "next/link";

import { WorkerInvitationsTable } from "@/components/worker/invitations-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/database";
import { BOOKING_STATUS, JOB_STATUS } from "@/lib/constants";
import { calculateDistance, formatCurrency, formatDateTime } from "@/lib/utils";

async function getWorker(workerId?: string) {
  return prisma.workerProfile.findFirst({
    where: workerId ? { id: workerId } : undefined,
    include: {
      user: true,
      bookings: {
        where: { status: BOOKING_STATUS.OFFERED },
        include: { job: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: workerId ? undefined : { createdAt: "asc" },
  });
}

async function getSuggestedJobs(workerId: string, skills: string[], rate: { min: number; max: number }) {
  const jobs = await prisma.jobPosting.findMany({
    where: {
      status: JOB_STATUS.OPEN,
      neededRoles: { hasSome: skills },
      rate: { gte: rate.min },
    },
    include: {
      employer: true,
    },
    orderBy: { start: "asc" },
    take: 6,
  });

  return jobs;
}

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

export default async function WorkerMatchesPage({ searchParams }: PageProps) {
  const workerId = typeof searchParams?.workerId === "string" ? searchParams.workerId : undefined;
  const worker = await getWorker(workerId);

  if (!worker) {
    notFound();
  }

  const suggestedJobs = await getSuggestedJobs(worker.id, worker.skills, {
    min: worker.minRate,
    max: worker.maxRate,
  });

  const invites = worker.bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    job: {
      id: booking.job.id,
      title: booking.job.title,
      location: booking.job.location,
      start: booking.job.start.toISOString(),
      end: booking.job.end.toISOString(),
      rate: booking.job.rate,
      employer: {
        company: booking.job.employer?.company ?? null,
      },
    },
  }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Badge variant="outline" className="w-fit">Matches</Badge>
        <h1 className="text-3xl font-semibold">Respond to invitations</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Accept quickly to lock in assignments. Decline gigs that aren’t a fit so we can keep matching you with better work.
        </p>
      </div>

      <WorkerInvitationsTable invites={invites} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suggested jobs</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/jobs">Browse all jobs</Link>
          </Button>
        </div>
        {suggestedJobs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {suggestedJobs.map((job) => {
              const distance = job.lat != null && job.lng != null
                ? calculateDistance(worker.homeLat, worker.homeLng, job.lat, job.lng)
                : null;
              return (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{job.title}</CardTitle>
                    <CardDescription>
                      {formatDateTime(job.start)} · {job.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div>Rate {formatCurrency(job.rate, false)}/hr • Needs {job.neededRoles.join(", ")}</div>
                    <div>Posted by {job.employer?.company ?? "Employer"}</div>
                    {distance != null ? (
                      <div>Approximately {distance.toFixed(1)} km from home base</div>
                    ) : null}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/jobs/${job.id}`}>View details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex min-h-[160px] items-center justify-center text-sm text-muted-foreground">
              No open jobs match your profile yet. Expand your availability or travel radius to discover more gigs.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
