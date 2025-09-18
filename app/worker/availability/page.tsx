import { notFound } from "next/navigation";

import { WorkerAvailabilityManager } from "@/components/worker/availability-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/database";

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

async function getWorker(workerId?: string) {
  return prisma.workerProfile.findFirst({
    where: workerId ? { id: workerId } : undefined,
    include: { availability: true },
    orderBy: workerId ? undefined : { createdAt: "asc" },
  });
}

export default async function WorkerAvailabilityPage({ searchParams }: PageProps) {
  const workerId = typeof searchParams?.workerId === "string" ? searchParams.workerId : undefined;
  const worker = await getWorker(workerId);

  if (!worker) {
    notFound();
  }

  const initialSlots = worker.availability
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((slot) => ({
      id: slot.id,
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      rolesOk: slot.rolesOk,
      minRate: slot.minRate,
    }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">Availability</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Let employers know when you’re free. Slots must cover the event times for you to appear in matches.
        </p>
      </div>

      <WorkerAvailabilityManager
        workerId={worker.id}
        initialSlots={initialSlots}
        defaultSkills={worker.skills}
        minRate={worker.minRate}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scheduling tips</CardTitle>
          <CardDescription>Boost your visibility with these best practices.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>Cover evenings and weekends for hospitality roles; that’s when demand spikes.</li>
            <li>Don’t forget to remove slots after accepting a booking to prevent double-booking.</li>
            <li>Set the minimum rate equal to your preferred rate for that time block.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
