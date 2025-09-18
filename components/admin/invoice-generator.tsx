"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

export type InvoiceJobOption = {
  id: string;
  title: string;
  start: string;
  acceptedCount: number;
};

type InvoiceGeneratorProps = {
  jobs: InvoiceJobOption[];
};

export function InvoiceGenerator({ jobs }: InvoiceGeneratorProps) {
  const { toast } = useToast();
  const [jobId, setJobId] = useState<string | null>(jobs[0]?.id ?? null);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to generate invoice" }));
        throw new Error(body.message ?? "Unable to generate invoice");
      }
      return (await response.json()) as { invoice: { id: string; pdfUrl?: string | null } };
    },
    onSuccess: ({ invoice }) => {
      toast({
        title: "Invoice created",
        description: invoice.pdfUrl ? `Saved to ${invoice.pdfUrl}` : "Generated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Invoice failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-3">
      <Select value={jobId ?? undefined} onValueChange={setJobId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select job" />
        </SelectTrigger>
        <SelectContent>
          {jobs.map((job) => (
            <SelectItem key={job.id} value={job.id}>
              <div className="flex flex-col">
                <span className="font-medium">{job.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(new Date(job.start))} • {job.acceptedCount} confirmed
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        onClick={() => jobId && mutation.mutate(jobId)}
        disabled={!jobId || mutation.isPending}
        className="w-full"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" /> Generate invoice
          </>
        )}
      </Button>
    </div>
  );
}
