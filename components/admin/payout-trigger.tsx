"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DollarSign, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export type PayoutOption = {
  bookingId: string;
  workerName: string;
  jobTitle: string;
  start: string;
  amount: number;
};

type PayoutTriggerProps = {
  bookings: PayoutOption[];
};

export function PayoutTrigger({ bookings }: PayoutTriggerProps) {
  const { toast } = useToast();
  const [selection, setSelection] = useState<string | null>(bookings[0]?.bookingId ?? null);

  const mutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to trigger payout" }));
        throw new Error(body.message ?? "Unable to trigger payout");
      }
      return (await response.json()) as { payout: { id: string } };
    },
    onSuccess: () => {
      toast({ title: "Payout queued", description: "Worker will receive funds in the next cycle." });
    },
    onError: (error: Error) => {
      toast({ title: "Payout failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-3">
      <Select value={selection ?? undefined} onValueChange={setSelection}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select booking" />
        </SelectTrigger>
        <SelectContent>
          {bookings.map((booking) => (
            <SelectItem key={booking.bookingId} value={booking.bookingId}>
              <div className="flex flex-col">
                <span className="font-medium">{booking.workerName}</span>
                <span className="text-xs text-muted-foreground">
                  {booking.jobTitle} • {formatDateTime(new Date(booking.start))} • {formatCurrency(booking.amount)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        className="w-full"
        onClick={() => selection && mutation.mutate(selection)}
        disabled={!selection || mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Triggering…
          </>
        ) : (
          <>
            <DollarSign className="mr-2 h-4 w-4" /> Trigger payout
          </>
        )}
      </Button>
    </div>
  );
}
