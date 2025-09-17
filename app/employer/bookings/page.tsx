import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
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
          bookings: { include: { worker: { include: { user: true } } } },
        },
      },
    },
    orderBy: employerId ? undefined : { createdAt: "asc" },
  });
}

export default async function EmployerBookingsPage({ searchParams }: PageProps) {
  const employerId = typeof searchParams?.employerId === "string" ? searchParams.employerId : undefined;
  const employer = await getEmployer(employerId);

  if (!employer) {
    notFound();
  }

  const rows = employer.jobs.flatMap((job) =>
    job.bookings.map((booking) => ({
      id: booking.id,
      status: booking.status,
      worker: booking.worker.user?.name ?? booking.worker.user?.email ?? "Worker",
      jobTitle: job.title,
      location: job.location,
      start: job.start,
      end: job.end,
    }))
  );

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Invites & confirmations</h1>
        <p className="text-sm text-muted-foreground">See which workers have accepted, declined, or are awaiting response.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All bookings</CardTitle>
          <CardDescription>Use this list to follow up with your team.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.worker}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.jobTitle}</div>
                      <div className="text-xs text-muted-foreground">{row.location}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status === BOOKING_STATUS.ACCEPTED ? "default" : row.status === BOOKING_STATUS.OFFERED ? "outline" : "secondary"}
                        className="capitalize"
                      >
                        {row.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>{formatDateTime(row.start)}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(row.end)}</div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                    No bookings yet. Invite workers from the candidate recommendations.
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
