"use client";

import { DatePicker } from "@/components/ui/DatePicker";
import { Typography } from "@/components/ui/Typography";
import { parseDateKey, toDateKey } from "@/lib/date";
import type { Matcher } from "react-day-picker";

interface DateRangeFieldsProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  minDate?: string;
  maxDate?: string;
}

function outOfRange(minDate?: string, maxDate?: string): Matcher[] {
  const matchers: Matcher[] = [];
  if (minDate) matchers.push({ before: parseDateKey(minDate) });
  if (maxDate) matchers.push({ after: parseDateKey(maxDate) });
  return matchers;
}

export function DateRangeFields({ start, end, onChange, minDate, maxDate }: DateRangeFieldsProps) {
  const disabled = outOfRange(minDate, maxDate);

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      <DatePicker
        value={start ? parseDateKey(start) : undefined}
        onChange={(date) => onChange(date ? toDateKey(date) : "", end)}
        placeholder="From"
        align="start"
        className="w-full sm:w-auto"
        disabled={disabled}
      />
      <Typography variant="small" className="shrink-0 self-center text-ink-3">
        to
      </Typography>
      <DatePicker
        value={end ? parseDateKey(end) : undefined}
        onChange={(date) => onChange(start, date ? toDateKey(date) : "")}
        placeholder="To"
        align="end"
        className="w-full sm:w-auto"
        disabled={disabled}
      />
    </div>
  );
}
