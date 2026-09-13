"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DateRangeFields } from "@/components/ui/DateRangeFields";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Typography } from "@/components/ui/Typography";
import { formatDate, parseDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { DashboardPeriod } from "@/types/Dashboard";

export const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "custom", label: "Custom" },
] as const;

export type Period = (typeof PERIOD_OPTIONS)[number]["value"];

export const PERIOD_TO_API: Record<Period, DashboardPeriod> = {
  today: "TODAY",
  "7d": "LAST_7_DAYS",
  "30d": "LAST_30_DAYS",
  "90d": "LAST_90_DAYS",
  custom: "CUSTOM",
};

export const PERIOD_HINT_LABEL: Record<Period, string> = {
  today: "today",
  "7d": "this week",
  "30d": "last 30 days",
  "90d": "last 90 days",
  custom: "in range",
};

export interface PeriodSelection {
  period: Period;
  startDate?: string;
  endDate?: string;
}

interface PeriodToggleProps {
  value: PeriodSelection;
  onChange: (value: PeriodSelection) => void;
  className?: string;
}

const optionClass =
  "shrink-0 cursor-pointer rounded-full border border-surface-line-strong px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-inset md:rounded-none md:border-y-0 md:border-r-0 md:px-4 md:py-2 md:first:border-l-0";
const selectedClass = "border-brand-deep bg-brand-deep text-white md:border-surface-line-strong";
const idleClass = "bg-surface-card text-ink-2 hover:bg-surface-stripe hover:text-ink-1";

function customLabel(value: PeriodSelection) {
  if (value.period !== "custom" || !value.startDate || !value.endDate) return "Custom";
  return `${formatDate(parseDateKey(value.startDate))} – ${formatDate(parseDateKey(value.endDate))}`;
}

export function PeriodToggle({ value, onChange, className }: PeriodToggleProps) {
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const rangeInvalid = Boolean(draftStart && draftEnd && draftStart > draftEnd);

  return (
    <div
      role="radiogroup"
      aria-label="Period"
      className={cn(
        "no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6",
        "md:mx-0 md:inline-flex md:gap-0 md:rounded-lg md:border md:border-surface-line-strong md:bg-surface-card md:px-0",
        className,
      )}
    >
      {PERIOD_OPTIONS.map((option) => {
        const selected = option.value === value.period;

        if (option.value === "custom") {
          return (
            <Popover
              key={option.value}
              onOpenChange={(open) => {
                if (open) {
                  setDraftStart(value.startDate ?? "");
                  setDraftEnd(value.endDate ?? "");
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(optionClass, selected ? selectedClass : idleClass)}
                >
                  {customLabel(value)}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="mt-2 w-[calc(100vw-2rem)] max-w-lg sm:w-[32rem]"
              >
                <PopoverHeader>
                  <PopoverTitle>Custom range</PopoverTitle>
                </PopoverHeader>
                <div className="flex flex-row items-center gap-4">
                  <PopoverDescription className="shrink-0">between</PopoverDescription>
                  <div className="min-w-0 flex-1">
                    <DateRangeFields
                      start={draftStart}
                      end={draftEnd}
                      onChange={(start, end) => {
                        setDraftStart(start);
                        setDraftEnd(end);
                      }}
                    />
                  </div>
                </div>
                {rangeInvalid && (
                  <Typography variant="xs" as="p" className="mt-2 text-state-danger">
                    Start date must not be after end date.
                  </Typography>
                )}
                <PopoverClose asChild>
                  <Button
                    className="mt-2"
                    variant="default"
                    disabled={!draftStart || !draftEnd || rangeInvalid}
                    onClick={() =>
                      onChange({ period: "custom", startDate: draftStart, endDate: draftEnd })
                    }
                  >
                    Apply
                  </Button>
                </PopoverClose>
              </PopoverContent>
            </Popover>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange({ period: option.value })}
            className={cn(optionClass, selected ? selectedClass : idleClass)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
