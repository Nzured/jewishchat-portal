"use client";

import * as React from "react";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
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
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Typography } from "@/components/ui/Typography";
import { formatDate, parseDateKey } from "@/lib/date";
import { cn } from "@/lib/utils";
import { OwnerGroupOption } from "@/types/OwnerDashboard";
import {
  ALL_GROUPS,
  CUSTOM_RANGE_ERROR_MESSAGE,
  type DashboardFilters as Filters,
  PERIOD_OPTIONS,
  validateCustomRange,
} from "./dashboardFilters";

interface FiltersBarProps {
  value: Filters;
  groups: OwnerGroupOption[];
  onChange: (value: Filters) => void;
  className?: string;
}

function customLabel(value: Filters) {
  if (value.period !== "custom" || !value.startDate || !value.endDate) return "Custom";
  return `${formatDate(parseDateKey(value.startDate))} – ${formatDate(parseDateKey(value.endDate))}`;
}

export function FiltersBar({ value, groups, onChange, className }: FiltersBarProps) {
  const [draftStart, setDraftStart] = React.useState("");
  const [draftEnd, setDraftEnd] = React.useState("");
  const rangeError = validateCustomRange(draftStart, draftEnd);

  const groupItems = [
    { label: "All Groups", value: ALL_GROUPS },
    ...groups.map((group) => ({ label: group.name, value: group.uuid })),
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      <div role="radiogroup" aria-label="Date range" className="flex flex-wrap items-center gap-2">
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
                  <Chip
                    shape="pill"
                    role="radio"
                    aria-checked={selected}
                    type={selected ? "active" : "neutral"}
                    leftIcon={<CalendarRange className="size-3.5" />}
                    label={customLabel(value)}
                    onClick={() => undefined}
                  />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="mt-2 w-[calc(100vw-2rem)] max-w-lg sm:w-[32rem]"
                >
                  <PopoverHeader>
                    <PopoverTitle>Custom range</PopoverTitle>
                    <PopoverDescription>Look back up to 16 months.</PopoverDescription>
                  </PopoverHeader>
                  <DateRangeFields
                    start={draftStart}
                    end={draftEnd}
                    onChange={(start, end) => {
                      setDraftStart(start);
                      setDraftEnd(end);
                    }}
                  />
                  {rangeError && (
                    <Typography variant="xs" as="p" className="mt-2 text-state-danger">
                      {CUSTOM_RANGE_ERROR_MESSAGE[rangeError]}
                    </Typography>
                  )}
                  <PopoverClose asChild>
                    <Button
                      className="mt-3 w-full sm:w-auto"
                      size="sm"
                      disabled={!draftStart || !draftEnd || Boolean(rangeError)}
                      onClick={() =>
                        onChange({
                          ...value,
                          period: "custom",
                          startDate: draftStart,
                          endDate: draftEnd,
                        })
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
            <Chip
              key={option.value}
              shape="pill"
              role="radio"
              aria-checked={selected}
              type={selected ? "active" : "neutral"}
              label={option.label}
              onClick={() =>
                onChange({
                  ...value,
                  period: option.value,
                  startDate: undefined,
                  endDate: undefined,
                })
              }
            />
          );
        })}
      </div>

      <SelectDropdown
        size="sm"
        aria-label="Group"
        items={groupItems}
        value={value.groupUuid}
        onValueChange={(groupUuid) => onChange({ ...value, groupUuid })}
        contentPosition="popper"
        contentClassName="thin-scrollbar max-h-64 w-(--radix-select-trigger-width) min-w-52"
        className="h-9 w-full sm:w-auto sm:min-w-52"
      />
    </div>
  );
}
