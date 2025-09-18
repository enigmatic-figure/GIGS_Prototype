import { notFound } from "next/navigation";

import { EmployerJobForm } from "@/components/employer/job-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/database";

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

async function getEmployer(employerId?: string) {
  return prisma.employerProfile.findFirst({
    where: employerId ? { id: employerId } : undefined,
    include: { user: true },
    orderBy: employerId ? undefined : { createdAt: "asc" },
  });
}

export default async function EmployerNewJobPage({ searchParams }: PageProps) {
  const employerId = typeof searchParams?.employerId === "string" ? searchParams.employerId : undefined;
  const employer = await getEmployer(employerId);

  if (!employer) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Create job</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Provide enough detail for workers to understand the scope, pay, and arrival expectations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event staffing request</CardTitle>
          <CardDescription>We’ll immediately run matching and alert top workers.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployerJobForm employerId={employer.id} />
        </CardContent>
      </Card>
    </div>
  );
}
