"use client";

import * as React from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { SearchDropdown } from "@/components/ui/SearchDropdown";
import { Typography } from "@/components/ui/Typography";
import { formatDate, parseDateKey, toDateKey } from "@/lib/date";
import type { FilterItem } from "@/types/Search";

function formatRangeBound(value?: string) {
  if (!value) return null;
  const num = Number(value);
  return Number.isNaN(num) ? value : num.toLocaleString();
}

function formatDateBound(value?: string) {
  return value ? formatDate(parseDateKey(value)) : null;
}

function getFilterValueLabel(filter?: FilterItem) {
  if (!filter || filter.value == null || filter.value === "") return null;

  if (filter.component === "NUMBER_RANGE" || filter.component === "DATE_RANGE") {
    const isDateRange = filter.component === "DATE_RANGE";
    const [start, end] = Array.isArray(filter.value) ? filter.value : [filter.value, ""];
    const startLabel = isDateRange ? formatDateBound(start) : formatRangeBound(start);
    const endLabel = isDateRange ? formatDateBound(end) : formatRangeBound(end);
    if (!startLabel && !endLabel) return null;
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
    if (isDateRange) return startLabel ? `From ${startLabel}` : `Until ${endLabel}`;
    return startLabel ? `≥ ${startLabel}` : `≤ ${endLabel}`;
  }

  const values = Array.isArray(filter.value) ? filter.value : [filter.value];
  return values
    .map((value) => filter.options?.find((opt) => opt.value === value)?.label ?? value)
    .join(", ");
}

interface SearchFilterChipProps {
  filter: FilterItem;
  appliedFilter?: FilterItem;
  onApply: (value: string | string[] | null) => void;
  onClear: () => void;
}

/** A quick filter: a chip that opens a popover with the field for that filter, and applies on close. */
export function SearchFilterChip({
  filter,
  appliedFilter,
  onApply,
  onClear,
}: SearchFilterChipProps) {
  const [draft, setDraft] = React.useState(filter.value);
  const [searchValue, setSearchValue] = React.useState(filter.searchValue ?? "");

  const appliedValueLabel = getFilterValueLabel(appliedFilter ?? filter);
  const [rangeStart, rangeEnd] =
    filter.component === "NUMBER_RANGE" || filter.component === "DATE_RANGE"
      ? Array.isArray(draft)
        ? draft
        : ["", ""]
      : ["", ""];

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          setDraft(filter.value);
          setSearchValue(filter.searchValue ?? "");
        }
      }}
    >
      <PopoverTrigger asChild>
        {appliedValueLabel ? (
          <Chip
            shape="rounded"
            label={
              <>
                <Typography variant="small" className="font-normal text-brand-deep">
                  {filter.label} :
                </Typography>{" "}
                <Typography variant="small" className="font-semibold text-brand-deep">
                  {appliedValueLabel}
                </Typography>
              </>
            }
            rightIcon={<X className="size-2.5" />}
            rightIconLabel={`Clear ${filter.label} filter`}
            onRightIconClick={onClear}
            className="border-state-success/20 bg-brand-soft text-state-success"
          />
        ) : (
          <Chip
            label={filter.label}
            shape="rounded"
            type="neutral"
            leftIcon={<PlusCircle className="text-ink-3" />}
          />
        )}
      </PopoverTrigger>
      <PopoverContent className="mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96">
        <PopoverHeader>
          <PopoverTitle>{`Filter by : ${filter.label}`}</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-row items-center gap-4">
          <PopoverDescription className="shrink-0">
            {filter.component === "NUMBER_RANGE" || filter.component === "DATE_RANGE"
              ? "between"
              : "contains"}
          </PopoverDescription>
          <div className="min-w-0 flex-1">
            {filter.component === "AUTOSELECT" || filter.component === "DROPDOWN" ? (
              <SearchDropdown
                items={(filter.options || []).filter((opt) =>
                  opt.label.toLowerCase().includes(searchValue.toLowerCase()),
                )}
                placeholder={"Search by " + filter.label}
                searchValue={searchValue}
                onSearchValueChange={setSearchValue}
                value={draft as string | null}
                onValueChange={setDraft}
              />
            ) : filter.component === "TEXT_INPUT" ? (
              <Input
                type="text"
                placeholder={"Enter " + filter.label}
                value={(draft as string) || ""}
                onChange={(e) => setDraft(e.target.value)}
              />
            ) : filter.component === "NUMBER_INPUT" ? (
              <Input
                type="number"
                placeholder={"Enter " + filter.label}
                value={(draft as string) || ""}
                onChange={(e) => setDraft(e.target.value)}
              />
            ) : filter.component === "NUMBER_RANGE" ? (
              <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={rangeStart || ""}
                  onChange={(e) => setDraft([e.target.value, rangeEnd])}
                />
                <Typography variant="small" className="shrink-0 self-center text-ink-3">
                  to
                </Typography>
                <Input
                  type="number"
                  placeholder="Max"
                  value={rangeEnd || ""}
                  onChange={(e) => setDraft([rangeStart, e.target.value])}
                />
              </div>
            ) : filter.component === "DATE_RANGE" ? (
              <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <DatePicker
                  value={rangeStart ? parseDateKey(rangeStart) : undefined}
                  onChange={(date) => setDraft([date ? toDateKey(date) : "", rangeEnd])}
                  placeholder="From"
                  align="start"
                  className="w-full sm:w-auto"
                />
                <Typography variant="small" className="shrink-0 self-center text-ink-3">
                  to
                </Typography>
                <DatePicker
                  value={rangeEnd ? parseDateKey(rangeEnd) : undefined}
                  onChange={(date) => setDraft([rangeStart, date ? toDateKey(date) : ""])}
                  placeholder="To"
                  align="end"
                  className="w-full sm:w-auto"
                />
              </div>
            ) : null}
          </div>
        </div>
        <PopoverClose asChild>
          <Button className="mt-2" variant="default" onClick={() => onApply(draft)}>
            Apply Filter
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
