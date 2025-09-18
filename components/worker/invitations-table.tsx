"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { BOOKING_STATUS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export type WorkerInvitation = {
  id: string;
  status: string;
  job: {
    id: string;
    title: string;
    location: string;
    start: string;
    end: string;
    rate: number;
    employer?: { company?: string | null } | null;
  };
};

type InvitationsTableProps = {
  invites: WorkerInvitation[];
};

export function WorkerInvitationsTable({ invites }: InvitationsTableProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState(invites);

  const mutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to update invitation" }));
        throw new Error(body.message ?? "Unable to update invitation");
      }
      return status;
    },
    onSuccess: (status, variables) => {
      setRows((current) =>
        current.map((row) =>
          row.id === variables.bookingId
            ? {
                ...row,
                status,
              }
            : row
        )
      );
      toast({ title: `Invitation ${status === BOOKING_STATUS.ACCEPTED ? "accepted" : "updated"}` });
    },
    onError: (error: Error) => {
      toast({ title: "Unable to update", description: error.message, variant: "destructive" });
    },
  });

  const pendingCount = useMemo(
    () => rows.filter((row) => row.status === BOOKING_STATUS.OFFERED).length,
    [rows]
  );

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No invitations yet. Once employers invite you, they will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Invitations</h2>
        <Badge variant={pendingCount ? "default" : "secondary"}>
          {pendingCount} pending
        </Badge>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isPending = row.status === BOOKING_STATUS.OFFERED;
              const isUpdating = mutation.isPending && mutation.variables?.bookingId === row.id;
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.job.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.job.employer?.company ?? "Employer"} • {row.job.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDateTime(new Date(row.job.start))}</div>
                    <div className="text-xs text-muted-foreground">Ends {formatDateTime(new Date(row.job.end))}</div>
                  </TableCell>
                  <TableCell>{formatCurrency(row.job.rate, false)}/hr</TableCell>
                  <TableCell>
                    <Badge variant={isPending ? "outline" : "secondary"} className="capitalize">
                      {row.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!isPending || isUpdating}
                        onClick={() => mutation.mutate({ bookingId: row.id, status: BOOKING_STATUS.DECLINED })}
                      >
                        {isUpdating && mutation.variables?.status === BOOKING_STATUS.DECLINED ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="mr-2 h-3.5 w-3.5" />
                        )}
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={!isPending || isUpdating}
                        onClick={() => mutation.mutate({ bookingId: row.id, status: BOOKING_STATUS.ACCEPTED })}
                      >
                        {isUpdating && mutation.variables?.status === BOOKING_STATUS.ACCEPTED ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-3.5 w-3.5" />
                        )}
                        Accept
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
