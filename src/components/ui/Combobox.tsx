"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { cn } from "@/lib/utils";

interface ComboboxItem {
  label: string;
  value: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
}

/** A searchable single-select, for lists too long for a plain `SelectDropdown` (e.g. countries, states). */
function Combobox({
  items,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled,
  id,
  className,
  ...props
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const selected = items.find((item) => item.value === value);
  const trimmedSearch = search.trim().toLowerCase();
  const filtered = trimmedSearch
    ? items.filter((item) => item.label.toLowerCase().includes(trimmedSearch))
    : items;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          {...props}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-1.5 rounded-lg border border-surface-line bg-surface-card py-2 pr-2 pl-2.5 text-sm outline-none transition-colors select-none focus-visible:border-brand-green disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-state-danger",
            !selected && "text-ink-4",
            className,
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-ink-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) gap-0 p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchInputRef.current?.focus();
        }}
      >
        <div className="border-b border-surface-line p-2">
          <Input
            ref={searchInputRef}
            type="search"
            placeholder={searchPlaceholder}
            leftIcon={<Search className="size-3.5" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 min-h-0 py-1.5 text-sm"
          />
        </div>
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-ink-4">{emptyText}</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onValueChange(item.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex w-full cursor-default items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm outline-hidden select-none hover:bg-brand-soft hover:text-brand-green",
                  item.value === value && "text-brand-green",
                )}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {item.value === value && <Check className="size-4" />}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox };
export type { ComboboxItem, ComboboxProps };
