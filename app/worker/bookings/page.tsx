import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { calculateJobPayment, formatCurrency, formatDateTime } from "@/lib/utils";

type PageProps = {
  searchParams?: Record<string, string | string[]>;
};

async function getWorker(workerId?: string) {
  return prisma.workerProfile.findFirst({
    where: workerId ? { id: workerId } : undefined,
    include: {
      bookings: {
        include: { job: { include: { employer: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: workerId ? undefined : { createdAt: "asc" },
  });
}

export default async function WorkerBookingsPage({ searchParams }: PageProps) {
  const workerId = typeof searchParams?.workerId === "string" ? searchParams.workerId : undefined;
  const worker = await getWorker(workerId);

  if (!worker) {
    notFound();
  }

  const rows = worker.bookings.map((booking) => {
    const amount = calculateJobPayment(booking.job.rate, booking.job.start, booking.job.end);
    return {
      id: booking.id,
      status: booking.status,
      title: booking.job.title,
      employer: booking.job.employer?.company ?? "Employer",
      start: booking.job.start,
      end: booking.job.end,
      rate: booking.job.rate,
      location: booking.job.location,
      amount,
    };
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">Bookings</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Track every offer and confirmation. Accepted jobs turn into payouts after the event is marked completed by the employer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job history</CardTitle>
          <CardDescription>Offers, confirmations, and completed gigs.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Employer</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estimated payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="font-medium">{row.title}</div>
                      <div className="text-xs text-muted-foreground">{row.location}</div>
                    </TableCell>
                    <TableCell>{row.employer}</TableCell>
                    <TableCell>
                      <div>{formatDateTime(row.start)}</div>
                      <div className="text-xs text-muted-foreground">Ends {formatDateTime(row.end)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.status === BOOKING_STATUS.ACCEPTED ? "default" : row.status === BOOKING_STATUS.COMPLETED ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {row.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(row.amount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No bookings yet. Invitations you accept will appear here.
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
