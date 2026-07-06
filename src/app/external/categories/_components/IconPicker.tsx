"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { ALL_ICON_NAMES, DEFAULT_ICON_NAMES, ICON_SEARCH_RESULTS_CAP } from "./categoryIcons";

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
  className?: string;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s-]+/g, "");
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [query, setQuery] = React.useState("");

  const searching = query.trim().length > 0;

  const matches = React.useMemo(() => {
    if (!searching) return DEFAULT_ICON_NAMES;
    const search = normalize(query);
    return ALL_ICON_NAMES.filter((name) => normalize(name).includes(search));
  }, [query, searching]);

  const visibleIcons = matches.slice(0, ICON_SEARCH_RESULTS_CAP);
  const hiddenCount = matches.length - visibleIcons.length;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Input
        leftIcon={<Search />}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="search for icons..."
      />

      <div className="max-h-56 overflow-y-auto rounded-lg border border-surface-line bg-surface-bg p-2">
        {visibleIcons?.length === 0 ? (
          <p className="flex items-center justify-center py-6 text-sm text-ink-3">
            No icons found.
          </p>
        ) : (
          <div className="grid grid-cols-8 gap-1">
            {visibleIcons.map((name) => {
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-pressed={selected}
                  onClick={() => onChange(name)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand-green",
                    selected && "bg-brand-soft text-brand-green ring-1 ring-brand-green/30",
                  )}
                >
                  <DynamicIcon name={name as IconName} className="size-4.5" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      {hiddenCount > 0 && (
        <p className="text-xs text-ink-4">
          Showing {visibleIcons.length} of {matches.length} matches — refine your search to see
          more.
        </p>
      )}
    </div>
  );
}
