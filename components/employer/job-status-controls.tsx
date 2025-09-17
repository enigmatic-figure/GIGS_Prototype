"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_STATUS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

type JobStatusControlsProps = {
  jobId: string;
  status: string;
};

const statuses = Object.values(JOB_STATUS);

export function JobStatusControls({ jobId, status }: JobStatusControlsProps) {
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: async (nextStatus: string) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to update job" }));
        throw new Error(body.message ?? "Unable to update job");
      }
      return nextStatus;
    },
    onSuccess: (nextStatus) => {
      toast({ title: "Job updated", description: `Status set to ${nextStatus.toLowerCase()}.` });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="flex items-center gap-3">
      <Select
        defaultValue={status}
        onValueChange={(value) => mutation.mutate(value)}
        disabled={mutation.isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((value) => (
            <SelectItem key={value} value={value} className="capitalize">
              {value.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => mutation.mutate(JOB_STATUS.FILLED)}
        disabled={mutation.isPending || status === JOB_STATUS.FILLED}
      >
        {mutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Mark filled
      </Button>
    </div>
  );
}
