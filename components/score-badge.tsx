import { cn } from "@/lib/utils";

const scoreThemes = [
  { threshold: 80, className: "from-emerald-500/90 to-emerald-600/90" },
  { threshold: 60, className: "from-sky-500/90 to-sky-600/90" },
  { threshold: 40, className: "from-amber-500/90 to-amber-600/90" },
  { threshold: 0, className: "from-rose-500/90 to-rose-600/90" },
];

export type ScoreBadgeProps = {
  score: number;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function ScoreBadge({ score, label = "Score", className, size = "md" }: ScoreBadgeProps) {
  const rounded = Math.round(score);
  const theme = scoreThemes.find((item) => rounded >= item.threshold) ?? scoreThemes.at(-1)!;
  const sizeClasses =
    size === "lg"
      ? "px-4 py-2 text-sm"
      : size === "sm"
        ? "px-2.5 py-1 text-xs"
        : "px-3 py-1.5 text-sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gradient-to-r font-medium text-white shadow-sm",
        sizeClasses,
        theme.className,
        className
      )}
      aria-label={`${label}: ${rounded}`}
    >
      <span className="text-xs uppercase tracking-wide opacity-90">{label}</span>
      <span className="text-base font-semibold leading-none">{rounded}</span>
    </span>
  );
}
