import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/database";
import { formatDateTime } from "@/lib/utils";

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

async function getEmployer(employerId?: string) {
  return prisma.employerProfile.findFirst({
    where: employerId ? { id: employerId } : undefined,
    include: {
      jobs: {
        include: {
          bookings: true,
        },
        orderBy: { start: "desc" },
      },
    },
    orderBy: employerId ? undefined : { createdAt: "asc" },
  });
}

export default async function EmployerJobsPage({ searchParams }: PageProps) {
  const employerId = typeof searchParams?.employerId === "string" ? searchParams.employerId : undefined;
  const employer = await getEmployer(employerId);

  if (!employer) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Jobs</h1>
          <p className="text-sm text-muted-foreground">Manage open, filled, and past events.</p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new">Create job</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All jobs</CardTitle>
          <CardDescription>Monitor progress and staffing status.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Headcount</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employer.jobs.length ? (
                employer.jobs.map((job) => {
                  const confirmed = job.bookings.filter((booking) => booking.status === "ACCEPTED").length;
                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-xs text-muted-foreground">{job.location}</div>
                      </TableCell>
                      <TableCell>
                        <div>{formatDateTime(job.start)}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(job.end)}</div>
                      </TableCell>
                      <TableCell className="capitalize">{job.status.toLowerCase()}</TableCell>
                      <TableCell>{job.headcount}</TableCell>
                      <TableCell>{confirmed}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/employer/jobs/${job.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    No jobs yet. Create your first posting to receive candidate suggestions.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
