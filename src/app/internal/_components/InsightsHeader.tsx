"use client";

import { Typography } from "@/components/ui/Typography";
import { type PeriodSelection, PeriodToggle } from "./PeriodToggle";

interface InsightsHeaderProps {
  title: string;
  subtitle: string;
  selection: PeriodSelection;
  onSelectionChange: (selection: PeriodSelection) => void;
}

export function InsightsHeader({
  title,
  subtitle,
  selection,
  onSelectionChange,
}: InsightsHeaderProps) {
  return (
    <div className="static z-20 -mx-6 flex flex-col gap-4 bg-surface-bg px-6 pt-8 pb-4 md:sticky md:top-0 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <Typography variant="h2" className="font-semibold text-ink-1">
          {title}
        </Typography>
        <Typography variant="p" className="text-ink-3">
          {subtitle}
        </Typography>
      </div>
      <PeriodToggle value={selection} onChange={onSelectionChange} className="md:shrink-0" />
    </div>
  );
}
