"use client";

import { Trash2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export type AvailabilitySlot = {
  id: string;
  start: Date;
  end: Date;
  rolesOk: string[];
  minRate: number;
};

export type AvailabilityGridProps = {
  slots: AvailabilitySlot[];
  loading?: boolean;
  onDeleteSlot?: (slotId: string) => void;
};

export function AvailabilityGrid({ slots, loading = false, onDeleteSlot }: AvailabilityGridProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!slots.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">No availability set</CardTitle>
          <CardDescription>Add availability slots so employers can book you instantly.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {slots.map((slot) => (
        <Card key={slot.id} className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {formatDateTime(slot.start)}
            </CardTitle>
            <CardDescription>Ends {formatDateTime(slot.end)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {slot.rolesOk.map((role) => (
                <Badge key={role} variant="outline" className="capitalize">
                  {role}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Minimum rate {formatCurrency(slot.minRate, false)}/hr
            </div>
            {onDeleteSlot ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDeleteSlot(slot.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove availability</span>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
