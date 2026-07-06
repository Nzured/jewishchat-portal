"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  align?: "start" | "end";
  className?: string;
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  align = "start",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const label = value ? formatDate(value) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          leftIcon={<CalendarIcon className="size-4 shrink-0" />}
          className={cn(
            "w-full min-w-0 shrink justify-start overflow-hidden",
            !value && "text-ink-4",
            className,
          )}
        >
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
