"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimeRangePicker, type DateTimeRange } from "@/components/date-time-range-picker";
import { SkillMultiSelect } from "@/components/skill-multi-select";
import { RateInput } from "@/components/rate-input";
import { AvailabilityGrid } from "@/components/availability-grid";
import { LIMITS, STAFF_ROLES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export type AvailabilityManagerSlot = {
  id: string;
  start: string;
  end: string;
  rolesOk: string[];
  minRate: number;
};

type AvailabilityManagerProps = {
  workerId: string;
  initialSlots: AvailabilityManagerSlot[];
  defaultSkills: string[];
  minRate: number;
};

export function WorkerAvailabilityManager({
  workerId,
  initialSlots,
  defaultSkills,
  minRate,
}: AvailabilityManagerProps) {
  const { toast } = useToast();
  const [slots, setSlots] = useState(() =>
    initialSlots.map((slot) => ({
      ...slot,
      start: new Date(slot.start),
      end: new Date(slot.end),
    }))
  );
  const [range, setRange] = useState<DateTimeRange>({ start: null, end: null });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(defaultSkills);
  const [minSlotRate, setMinSlotRate] = useState(minRate);

  const skillOptions = useMemo(
    () => STAFF_ROLES.map((role) => ({ value: role, label: role })),
    []
  );

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!range.start || !range.end) {
        throw new Error("Select a date range to add availability");
      }
      if (!selectedSkills.length) {
        throw new Error("Choose at least one skill to apply to this slot");
      }

      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          start: range.start,
          end: range.end,
          rolesOk: selectedSkills,
          minRate: minSlotRate,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to add availability" }));
        throw new Error(body.message ?? "Unable to add availability");
      }

      const json = (await response.json()) as {
        availability: { id: string; start: string; end: string; rolesOk: string[]; minRate: number };
      };

      return json.availability;
    },
    onSuccess: (availability) => {
      setSlots((current) => [
        ...current,
        {
          ...availability,
          start: new Date(availability.start),
          end: new Date(availability.end),
        },
      ]);
      toast({ title: "Availability added" });
    },
    onError: (error: Error) => {
      toast({ title: "Unable to add availability", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const response = await fetch(`/api/availability?id=${slotId}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to remove slot" }));
        throw new Error(body.message ?? "Unable to remove slot");
      }
      return slotId;
    },
    onSuccess: (slotId) => {
      setSlots((current) => current.filter((slot) => slot.id !== slotId));
      toast({ title: "Availability removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Unable to remove slot", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add availability</CardTitle>
          <CardDescription>Slots determine which jobs appear in your matches feed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DateTimeRangePicker value={range} onChange={setRange} minDate={new Date()} />
          <SkillMultiSelect value={selectedSkills} onChange={setSelectedSkills} options={skillOptions} />
          <RateInput
            value={minSlotRate}
            onChange={setMinSlotRate}
            label="Minimum rate for this slot"
            min={LIMITS.MIN_HOURLY_RATE}
            max={LIMITS.MAX_HOURLY_RATE}
          />
          <Button type="button" onClick={handleCreate} disabled={createMutation.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            {createMutation.isPending ? "Adding..." : "Add availability"}
          </Button>
        </CardContent>
      </Card>

      <AvailabilityGrid
        slots={slots}
        loading={createMutation.isPending && !slots.length}
        onDeleteSlot={(slotId) => deleteMutation.mutate(slotId)}
      />
    </div>
  );
}
