import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, CalendarRange, ClipboardPlus, Users } from "lucide-react";

import { prisma } from "@/lib/database";
import { BOOKING_STATUS, JOB_STATUS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

async function getEmployer(employerId?: string) {
  return prisma.employerProfile.findFirst({
    where: employerId ? { id: employerId } : undefined,
    include: {
      user: true,
      jobs: {
        include: {
          bookings: true,
        },
        orderBy: { start: "asc" },
      },
    },
    orderBy: employerId ? undefined : { createdAt: "asc" },
  });
}

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

export default async function EmployerDashboard({ searchParams }: PageProps) {
  const employerId = typeof searchParams?.employerId === "string" ? searchParams.employerId : undefined;
  const employer = await getEmployer(employerId);

  if (!employer) {
    notFound();
  }

  const activeJobs = employer.jobs.filter((job) =>
    job.status === JOB_STATUS.OPEN || job.status === JOB_STATUS.PARTIALLY_FILLED
  );
  const pendingInvites = employer.jobs.reduce(
    (sum, job) => sum + job.bookings.filter((booking) => booking.status === BOOKING_STATUS.OFFERED).length,
    0
  );
  const confirmed = employer.jobs.reduce(
    (sum, job) => sum + job.bookings.filter((booking) => booking.status === BOOKING_STATUS.ACCEPTED).length,
    0
  );

  const upcomingJobs = employer.jobs.slice(0, 5);
  const suggestionsJobId = activeJobs[0]?.id ?? employer.jobs[0]?.id ?? null;
  const viewSuggestionsHref = suggestionsJobId ? `/employer/candidates/${suggestionsJobId}` : null;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border bg-gradient-to-r from-blue-50 via-white to-blue-50 px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit">Employer workspace</Badge>
            <div>
              <h1 className="text-3xl font-semibold">Welcome back{employer.user?.name ? `, ${employer.user.name.split(" ")[0]}` : ""}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Post jobs, review recommended talent, and manage confirmations from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/employer/jobs/new">Post a job</Link>
              </Button>
              {viewSuggestionsHref ? (
                <Button asChild variant="outline">
                  <Link href={viewSuggestionsHref}>View suggestions</Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:w-80">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                  Active jobs
                </CardDescription>
                <CardTitle className="text-3xl">{activeJobs.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                  Pending invites
                </CardDescription>
                <CardTitle className="text-3xl">{pendingInvites}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                  Confirmed staff
                </CardDescription>
                <CardTitle className="text-3xl">{confirmed}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                  Company
                </CardDescription>
                <CardTitle className="text-lg">{employer.company}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create a job</CardTitle>
            <ClipboardPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Share event details, compensation, and staffing needs.</p>
            <Button asChild size="sm">
              <Link href="/employer/jobs/new">Start posting</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Our engine ranks workers based on skills, availability, and proximity.</p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/employer/candidates/${employer.jobs[0]?.id ?? ""}`}>See recommendations</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Track confirmations</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Monitor who’s accepted and follow up with outstanding invites.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/employer/bookings">Manage bookings</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>See fill rates, total spend, and worker satisfaction trends.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/employer/bookings">View dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming jobs</CardTitle>
          <CardDescription>Keep tabs on staffing progress.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Needed</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead>Confirmed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingJobs.length > 0 ? (
                upcomingJobs.map((job) => {
                  const invited = job.bookings.filter((b) => b.status === BOOKING_STATUS.OFFERED).length;
                  const accepted = job.bookings.filter((b) => b.status === BOOKING_STATUS.ACCEPTED).length;
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
                      <TableCell>{job.headcount}</TableCell>
                      <TableCell>{invited}</TableCell>
                      <TableCell>{accepted}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No upcoming jobs yet. Post a job to get started.
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
