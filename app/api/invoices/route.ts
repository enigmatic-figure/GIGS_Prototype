import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { applyRateLimit, identifyRequest } from "@/lib/rate-limit";
import { createInvoiceSchema } from "@/lib/schemas";

type InvoiceJob = {
  id: string;
  employerId: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  rate: number;
  location: string;
  employer: { user: { name: string | null; email: string | null } | null; company?: string | null } | null;
  bookings: Array<{
    workerId: string;
    worker: { user: { name: string | null; email: string | null } | null };
  }>;
};

const INVOICE_DIR = path.join(process.cwd(), "public", "invoices");

function rateHeaders(limit: ReturnType<typeof applyRateLimit>) {
  return {
    "X-RateLimit-Limit": String(limit.limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit.remaining)),
    "X-RateLimit-Reset": String(limit.reset),
  } satisfies Record<string, string>;
}

async function generateInvoicePdf({
  invoiceId,
  job,
  amountDollars,
  employerName,
  acceptedBookings,
}: {
  invoiceId: string;
  job: {
    title: string;
    description: string;
    start: Date;
    end: Date;
    rate: number;
    location: string;
  };
  amountDollars: number;
  employerName: string;
  acceptedBookings: { workerName: string }[];
}): Promise<string> {
  await mkdir(INVOICE_DIR, { recursive: true });
  const filePath = path.join(INVOICE_DIR, `${invoiceId}.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  const stream = createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice ID: ${invoiceId}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Employer: ${employerName}`);
  doc.moveDown();

  doc.fontSize(14).text(job.title, { underline: true });
  doc.fontSize(11).text(job.description);
  doc.moveDown();
  doc.text(`Location: ${job.location}`);
  doc.text(`Start: ${job.start.toUTCString()}`);
  doc.text(`End: ${job.end.toUTCString()}`);
  doc.text(`Rate: $${job.rate}/hr`);
  doc.moveDown();

  doc.fontSize(13).text("Workers", { underline: true });
  doc.moveDown(0.5);

  acceptedBookings.forEach((booking, index) => {
    doc.fontSize(11).text(`${index + 1}. ${booking.workerName}`);
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total Due: $${amountDollars.toFixed(2)}`, { align: "right" });

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });

  return filePath;
}

export async function POST(request: Request) {
  const identifier = identifyRequest(request);
  const limit = applyRateLimit({ key: `invoices:post:${identifier}`, limit: 10, windowMs: 60_000 });

  if (!limit.success) {
    return NextResponse.json(
      { message: "Too many invoice requests." },
      { status: 429, headers: rateHeaders(limit) }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload for /api/invoices", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400, headers: rateHeaders(limit) }
    );
  }

  const parsed = createInvoiceSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", errors: parsed.error.flatten() },
      { status: 422, headers: rateHeaders(limit) }
    );
  }

  try {
    const job = (await prisma.jobPosting.findUnique({
      where: { id: parsed.data.jobId },
      include: {
        employer: { include: { user: true } },
        bookings: {
          where: { status: BOOKING_STATUS.ACCEPTED },
          include: { worker: { include: { user: true } } },
        },
      },
    })) as InvoiceJob | null;

    if (!job) {
      return NextResponse.json(
        { message: "Job not found." },
        { status: 404, headers: rateHeaders(limit) }
      );
    }

    if (!job.bookings.length) {
      return NextResponse.json(
        { message: "No accepted bookings to invoice." },
        { status: 400, headers: rateHeaders(limit) }
      );
    }

    const durationHours = Math.max(1, (job.end.getTime() - job.start.getTime()) / (1000 * 60 * 60));
    const amountDollars = job.rate * durationHours * job.bookings.length;
    const amountCents = Math.round(amountDollars * 100);

    const invoice = await prisma.invoice.create({
      data: {
        employerId: job.employerId,
        jobId: job.id,
        amountCents,
        status: "SENT",
      },
    });

    const acceptedBookings = job.bookings.map((booking) => ({
      workerName:
        booking.worker.user?.name ?? booking.worker.user?.email ?? booking.workerId,
    }));

    let pdfUrl = "";
    try {
      await generateInvoicePdf({
        invoiceId: invoice.id,
        job: {
          title: job.title,
          description: job.description,
          start: job.start,
          end: job.end,
          rate: job.rate,
          location: job.location,
        },
        amountDollars,
        employerName: job.employer?.user?.name ?? job.employer?.company ?? "Employer",
        acceptedBookings,
      });
      pdfUrl = `/invoices/${invoice.id}.pdf`;
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl },
      });
    } catch (error) {
      console.error("Failed to generate invoice PDF", error);
    }

    console.log("🧾 Invoice generated", {
      invoiceId: invoice.id,
      jobId: job.id,
      amountCents,
      pdfUrl,
    });

    return NextResponse.json(
      {
        message: "Invoice created",
        invoice: {
          ...invoice,
          pdfUrl: pdfUrl || invoice.pdfUrl,
        },
      },
      { status: 201, headers: rateHeaders(limit) }
    );
  } catch (error) {
    console.error("Failed to create invoice", error);
    return NextResponse.json(
      { message: "Failed to create invoice." },
      { status: 500, headers: rateHeaders(limit) }
    );
  }
}
