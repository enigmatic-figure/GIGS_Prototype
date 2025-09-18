import { InvoiceGenerator } from "@/components/admin/invoice-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function AdminInvoicesPage() {
  const [jobs, invoices] = await Promise.all([
    prisma.jobPosting.findMany({
      include: {
        bookings: { where: { status: BOOKING_STATUS.ACCEPTED } },
      },
      orderBy: { start: "desc" },
    }),
    prisma.invoice.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const options = jobs
    .filter((job) => job.bookings.length > 0)
    .map((job) => ({
      id: job.id,
      title: job.title,
      start: job.start.toISOString(),
      acceptedCount: job.bookings.length,
    }));

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Invoices</h1>
        <p className="text-sm text-muted-foreground">Generate PDF invoices after events are staffed.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create invoice</CardTitle>
          <CardDescription>Select a job with confirmed workers.</CardDescription>
        </CardHeader>
        <CardContent>
          {options.length ? (
            <InvoiceGenerator jobs={options} />
          ) : (
            <p className="text-sm text-muted-foreground">No jobs with confirmed workers yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All invoices</CardTitle>
          <CardDescription>Recent billing documents.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length ? (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(invoice.createdAt)}</div>
                    </TableCell>
                    <TableCell>{invoice.jobId}</TableCell>
                    <TableCell>{formatCurrency(invoice.amountCents / 100)}</TableCell>
                    <TableCell className="capitalize">{invoice.status.toLowerCase()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                    No invoices generated yet.
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
