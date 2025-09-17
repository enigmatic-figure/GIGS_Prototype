"use client";

import { useMemo, useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { addMinutes, format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDateTime } from "@/lib/utils";

export type DateTimeRange = {
  start: Date | null;
  end: Date | null;
};

export type DateTimeRangePickerProps = {
  value: DateTimeRange;
  onChange: (value: DateTimeRange) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  timeStepMinutes?: number;
  minDate?: Date;
  className?: string;
};

function toTimeString(date: Date | null, fallback: string) {
  if (!date) return fallback;
  return format(date, "HH:mm");
}

function applyTime(base: Date, timeString: string) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const next = new Date(base);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function DateTimeRangePicker({
  value,
  onChange,
  label = "Date & Time",
  placeholder = "Select range",
  disabled = false,
  timeStepMinutes = 30,
  minDate,
  className,
}: DateTimeRangePickerProps) {
  const [open, setOpen] = useState(false);

  const timeOptions = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: Math.ceil((24 * 60) / timeStepMinutes) }, (_, index) => {
      const option = addMinutes(start, index * timeStepMinutes);
      return format(option, "HH:mm");
    });
  }, [timeStepMinutes]);

  const range: DateRange | undefined = value.start
    ? { from: value.start, to: value.end ?? value.start }
    : value.end
      ? { from: value.end, to: value.end }
      : undefined;

  const displayValue = value.start && value.end
    ? `${formatDateTime(value.start)} → ${formatDateTime(value.end)}`
    : placeholder;

  const defaultStartTime = "09:00";
  const defaultEndTime = "17:00";

  const selectedStartTime = toTimeString(value.start, defaultStartTime);
  const selectedEndTime = toTimeString(value.end, defaultEndTime);

  const updateRange = (nextRange: DateRange | undefined) => {
    if (!nextRange?.from) {
      onChange({ start: null, end: null });
      return;
    }

    const baseStart = applyTime(nextRange.from, selectedStartTime);
    const baseEnd = nextRange.to ? applyTime(nextRange.to, selectedEndTime) : applyTime(nextRange.from, selectedEndTime);

    let nextStart = baseStart;
    let nextEnd = baseEnd;

    if (nextEnd <= nextStart) {
      nextEnd = addMinutes(nextStart, timeStepMinutes);
    }

    onChange({ start: nextStart, end: nextEnd });
  };

  const handleStartTimeChange = (time: string) => {
    if (!value.start && !value.end) return;
    const base = value.start ?? value.end ?? new Date();
    const updatedStart = applyTime(base, time);
    let updatedEnd = value.end;

    if (updatedEnd && updatedEnd <= updatedStart) {
      updatedEnd = addMinutes(updatedStart, timeStepMinutes);
    }

    onChange({ start: updatedStart, end: updatedEnd ?? addMinutes(updatedStart, timeStepMinutes) });
  };

  const handleEndTimeChange = (time: string) => {
    if (!value.start && !value.end) return;
    const base = value.end ?? value.start ?? new Date();
    const updatedEnd = applyTime(base, time);
    let updatedStart = value.start;

    if (updatedStart && updatedEnd <= updatedStart) {
      updatedStart = addMinutes(updatedEnd, -timeStepMinutes);
    }

    onChange({ start: updatedStart ?? addMinutes(updatedEnd, -timeStepMinutes), end: updatedEnd });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value.start || !value.end ? "text-muted-foreground" : undefined
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="grid gap-4">
            <Calendar
              mode="range"
              selected={range}
              onSelect={updateRange}
              numberOfMonths={2}
              disabled={disabled}
              fromDate={minDate}
            />
            <div className="grid gap-2">
              <div className="text-sm font-medium">Time</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Start</span>
                  <Select value={selectedStartTime} onValueChange={handleStartTimeChange} disabled={disabled}>
                    <SelectTrigger>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {option}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">End</span>
                  <Select value={selectedEndTime} onValueChange={handleEndTimeChange} disabled={disabled}>
                    <SelectTrigger>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {option}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
