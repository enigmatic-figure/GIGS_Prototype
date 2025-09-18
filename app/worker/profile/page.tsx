import { notFound } from "next/navigation";

import { WorkerProfileForm } from "@/components/worker/worker-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/database";
import { STAFF_ROLES } from "@/lib/constants";

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

async function getWorker(workerId?: string) {
  return prisma.workerProfile.findFirst({
    where: workerId ? { id: workerId } : undefined,
    include: { user: true },
    orderBy: workerId ? undefined : { createdAt: "asc" },
  });
}

export default async function WorkerProfilePage({ searchParams }: PageProps) {
  const workerId = typeof searchParams?.workerId === "string" ? searchParams.workerId : undefined;
  const worker = await getWorker(workerId);

  if (!worker) {
    notFound();
  }

  const defaultValues = {
    skills: worker.skills.length ? worker.skills : [STAFF_ROLES[0]],
    minRate: worker.minRate,
    maxRate: worker.maxRate,
    radiusKm: worker.radiusKm,
    homeLat: worker.homeLat,
    homeLng: worker.homeLng,
  } as const;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Badge variant="outline" className="w-fit">Update your public profile</Badge>
        <h1 className="text-3xl font-semibold">Tell employers what makes you great</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          This information powers the matching engine that employers use to discover you. Accurate skills, rates, and location
          data means better invitations.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <WorkerProfileForm workerId={worker.id} defaultValues={defaultValues} />
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matching tips</CardTitle>
              <CardDescription>Based on data from the highest-rated workers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-5">
                <li>Keep at least three availability slots on the calendar to rank higher.</li>
                <li>Use a realistic travel radius so you only see jobs you can reach on time.</li>
                <li>Respond to invitations within 6 hours to maintain top-tier response score.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need help?</CardTitle>
              <CardDescription>Our support team can update your profile for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Email support@gigs.com with your preferred changes.</p>
              <p>We’ll confirm updates within one business day.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
