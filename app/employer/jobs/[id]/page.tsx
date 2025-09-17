import Link from "next/link";
import { notFound } from "next/navigation";

import { JobStatusControls } from "@/components/employer/job-status-controls";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

async function getJob(id: string) {
  return prisma.jobPosting.findUnique({
    where: { id },
    include: {
      employer: { include: { user: true } },
      bookings: {
        include: { worker: { include: { user: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

type PageProps = {
  params: { id: string };
};

export default async function EmployerJobDetailPage({ params }: PageProps) {
  const job = await getJob(params.id);

  if (!job) {
    notFound();
  }

  const invited = job.bookings.filter((booking) => booking.status === BOOKING_STATUS.OFFERED).length;
  const confirmed = job.bookings.filter((booking) => booking.status === BOOKING_STATUS.ACCEPTED).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit">Job detail</Badge>
        <h1 className="text-3xl font-semibold">{job.title}</h1>
        <p className="text-sm text-muted-foreground">{job.location} • {formatDateTime(job.start)} → {formatDateTime(job.end)}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
          <CardDescription>Adjust status once your team is confirmed.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div><span className="font-medium text-foreground">Employer:</span> {job.employer?.company ?? job.employer?.user?.name ?? "Employer"}</div>
            <div><span className="font-medium text-foreground">Roles:</span> {job.neededRoles.join(", ")}</div>
            <div><span className="font-medium text-foreground">Rate:</span> {formatCurrency(job.rate, false)}/hr</div>
            <div><span className="font-medium text-foreground">Headcount:</span> {job.headcount}</div>
            <div><span className="font-medium text-foreground">Invited:</span> {invited}</div>
            <div><span className="font-medium text-foreground">Confirmed:</span> {confirmed}</div>
          </div>
          <div className="space-y-4">
            <JobStatusControls jobId={job.id} status={job.status} />
            <Button asChild variant="outline" size="sm">
              <Link href={`/employer/candidates/${job.id}`}>View candidate recommendations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bookings</CardTitle>
          <CardDescription>Invited workers and their responses.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {job.bookings.length ? (
                job.bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{booking.worker.user?.name ?? booking.worker.user?.email ?? "Worker"}</div>
                      <div className="text-xs text-muted-foreground">{booking.worker.skills.join(", ")}</div>
                    </TableCell>
                    <TableCell className="capitalize">{booking.status.toLowerCase()}</TableCell>
                    <TableCell>{booking.createdAt.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      Rate range {formatCurrency(booking.worker.minRate, false)}-{formatCurrency(booking.worker.maxRate, false)}/hr
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                    No invitations yet. Invite workers from the suggestions page.
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
