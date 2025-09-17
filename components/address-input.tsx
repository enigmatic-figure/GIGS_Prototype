"use client";

import { ChangeEvent } from "react";
import { MapPin, Navigation } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AddressValue = {
  address: string;
  lat?: number | string | null;
  lng?: number | string | null;
};

export type AddressInputProps = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  label?: string;
  showCoordinates?: boolean;
  description?: string;
  disabled?: boolean;
  className?: string;
  onUseCurrentLocation?: () => void;
};

export function AddressInput({
  value,
  onChange,
  label = "Location",
  showCoordinates = true,
  description,
  disabled = false,
  className,
  onUseCurrentLocation,
}: AddressInputProps) {
  const handleFieldChange = (field: keyof AddressValue) => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-primary" />
          {label}
        </Label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Input
        value={value.address}
        onChange={handleFieldChange("address")}
        placeholder="123 Main St, City, State"
        disabled={disabled}
      />
      {showCoordinates ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="lat" className="text-xs text-muted-foreground">
              Latitude
            </Label>
            <Input
              id="lat"
              value={value.lat ?? ""}
              onChange={handleFieldChange("lat")}
              placeholder="40.7128"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lng" className="text-xs text-muted-foreground">
              Longitude
            </Label>
            <Input
              id="lng"
              value={value.lng ?? ""}
              onChange={handleFieldChange("lng")}
              placeholder="-74.0060"
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
      {onUseCurrentLocation ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={onUseCurrentLocation}
          disabled={disabled}
        >
          <Navigation className="h-4 w-4" />
          Use current location
        </Button>
      ) : null}
    </div>
  );
}
