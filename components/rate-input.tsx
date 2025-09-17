"use client";

import { useId, type ChangeEvent } from "react";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatCurrency } from "@/lib/utils";

export type RateInputProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  currency?: string;
  className?: string;
};

export function RateInput({
  value,
  onChange,
  label = "Hourly Rate",
  description,
  min = 15,
  max = 100,
  step = 1,
  disabled = false,
  currency = "USD",
  className,
}: RateInputProps) {
  const id = useId();

  const handleSliderChange = (next: number[]) => {
    if (!next.length) return;
    onChange(Math.round(next[0]));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(parsed)) {
      onChange(min);
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <Label htmlFor={id} className="font-medium">
          {label}
        </Label>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <div className="min-w-[120px]">
          <Input
            id={id}
            type="number"
            inputMode="numeric"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-describedby={description ? `${id}-description` : undefined}
          />
        </div>
        <div className="flex-1">
          <Slider
            value={[value]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-label={`${label} slider`}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(min, false)}</span>
            <span>{formatCurrency(max, false)}</span>
          </div>
        </div>
        <div className="min-w-[120px] rounded-md border px-3 py-2 text-sm font-semibold text-primary">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">/hr</span>
        </div>
      </div>
    </div>
  );
}
