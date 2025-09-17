import { PayoutTrigger } from "@/components/admin/payout-trigger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function AdminPayoutsPage() {
  const [bookings, payouts] = await Promise.all([
    prisma.booking.findMany({
      where: { status: BOOKING_STATUS.ACCEPTED },
      include: { worker: { include: { user: true } }, job: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payout.findMany({
      include: { worker: { include: { user: true } }, booking: { include: { job: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const options = bookings.map((booking) => ({
    bookingId: booking.id,
    workerName: booking.worker.user?.name ?? booking.worker.user?.email ?? "Worker",
    jobTitle: booking.job.title,
    start: booking.job.start.toISOString(),
    amount: (booking.job.rate * ((booking.job.end.getTime() - booking.job.start.getTime()) / (1000 * 60 * 60))),
  }));

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Payouts</h1>
        <p className="text-sm text-muted-foreground">Generate payout stubs after confirming worker attendance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trigger payout</CardTitle>
          <CardDescription>Select a booking to create or refresh a payout record.</CardDescription>
        </CardHeader>
        <CardContent>
          {options.length ? (
            <PayoutTrigger bookings={options} />
          ) : (
            <p className="text-sm text-muted-foreground">No confirmed bookings available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payout history</CardTitle>
          <CardDescription>Most recent payout calculations.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payout</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length ? (
                payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div className="font-medium">{payout.id}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(payout.createdAt)}</div>
                    </TableCell>
                    <TableCell>{payout.worker.user?.name ?? payout.worker.user?.email ?? payout.workerId}</TableCell>
                    <TableCell>{payout.booking.job.title}</TableCell>
                    <TableCell className="capitalize">{payout.status.toLowerCase()}</TableCell>
                    <TableCell>{formatCurrency(payout.amountCents / 100)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No payouts recorded yet.
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
