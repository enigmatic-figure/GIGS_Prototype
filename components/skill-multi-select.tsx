"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type SkillOption = {
  value: string;
  label?: string;
  description?: string;
};

export type SkillMultiSelectProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: SkillOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  maxVisibleBadges?: number;
  className?: string;
};

export function SkillMultiSelect({
  value,
  onChange,
  options,
  label = "Skills",
  placeholder = "Select skills",
  disabled = false,
  maxVisibleBadges = 3,
  className,
}: SkillMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleValue = (nextValue: string) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((skill) => skill !== nextValue));
    } else {
      onChange([...value, nextValue]);
    }
  };

  const selectedOptions = useMemo(
    () =>
      value
        .map((selected) => options.find((option) => option.value === selected))
        .filter((option): option is SkillOption => Boolean(option)),
    [options, value]
  );

  const visibleBadges = selectedOptions.slice(0, maxVisibleBadges);
  const hiddenCount = selectedOptions.length - visibleBadges.length;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate text-left">
              {selectedOptions.length ? `${selectedOptions.length} selected` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search skills..." className="h-9" />
            <CommandEmpty>No skill found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggleValue(option.value)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={isSelected} aria-hidden tabIndex={-1} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{option.label ?? option.value}</span>
                      {option.description ? (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      ) : null}
                    </div>
                    {isSelected ? <Check className="ml-auto h-4 w-4 text-primary" /> : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length ? (
        <div className="flex flex-wrap gap-2">
          {visibleBadges.map((option) => (
            <Badge key={option.value} variant="secondary" className="flex items-center gap-1">
              {option.label ?? option.value}
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
                onClick={() => toggleValue(option.value)}
                aria-label={`Remove ${option.label ?? option.value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {hiddenCount > 0 ? (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{hiddenCount} more
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onChange([])}
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  );
}
