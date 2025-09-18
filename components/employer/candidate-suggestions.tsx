"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/score-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export type CandidateSuggestion = {
  workerId: string;
  workerName?: string | null;
  workerEmail?: string | null;
  skills: string[];
  minRate: number;
  maxRate: number;
  distanceKm: number | null;
  metrics: {
    finalScore: number;
    skillOverlap: number;
    rateFit: number;
    availabilityCoverage: number;
    overlapHours: number;
    distanceScore: number;
  };
  availabilityPreview: Array<{ start: string; end: string; rolesOk: string[]; minRate: number }>;
};

type CandidateSuggestionsProps = {
  jobId: string;
  suggestions: CandidateSuggestion[];
};

export function CandidateSuggestions({ jobId, suggestions }: CandidateSuggestionsProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState(suggestions);

  const mutation = useMutation({
    mutationFn: async (workerId: string) => {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, inviteWorkerId: workerId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to send invitation" }));
        throw new Error(body.message ?? "Unable to send invitation");
      }
      return (await response.json()) as { invited?: { bookingId: string } | null };
    },
    onSuccess: (_data, workerId) => {
      toast({ title: "Invitation sent", description: "The worker has been notified." });
      setRows((current) =>
        current.map((row) =>
          row.workerId === workerId ? { ...row, invited: true } : row
        )
      );
    },
    onError: (error: Error) => {
      toast({ title: "Unable to invite", description: error.message, variant: "destructive" });
    },
  });

  if (!rows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No matches yet</CardTitle>
          <CardDescription>
            Adjust job requirements or rate to expand the talent pool.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Suggested candidates</CardTitle>
          <CardDescription>Score combines skills, rates, availability, and distance.</CardDescription>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" /> {rows.length} suggestions
        </Badge>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const invited = (row as { invited?: boolean }).invited;
              const isLoading = mutation.isPending && mutation.variables === row.workerId;
              return (
                <TableRow key={row.workerId}>
                  <TableCell>
                    <div className="font-medium">{row.workerName ?? "Unnamed worker"}</div>
                    <div className="text-xs text-muted-foreground">
                      Prefers {formatCurrency(row.minRate, false)}-{formatCurrency(row.maxRate, false)}/hr
                      {row.distanceKm != null ? ` • ${row.distanceKm.toFixed(1)} km away` : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={row.metrics.finalScore * 100} label="Match" />
                    <div className="mt-1 text-xs text-muted-foreground">
                      Skills {(row.metrics.skillOverlap * 100).toFixed(0)}% • Availability {(row.metrics.availabilityCoverage * 100).toFixed(0)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="capitalize">
                          {skill}
                        </Badge>
                      ))}
                      {row.skills.length > 4 ? (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          +{row.skills.length - 4}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {row.availabilityPreview.slice(0, 2).map((slot, index) => (
                        <div key={index}>
                          {formatDateTime(new Date(slot.start))} · {slot.rolesOk.join(", ")}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => mutation.mutate(row.workerId)}
                      disabled={invited || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                        </>
                      ) : invited ? (
                        "Invited"
                      ) : (
                        "Invite"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
