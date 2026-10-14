"use client";

import * as React from "react";
import { ArrowRight, Search } from "lucide-react";
import { HERO_SEARCH_DEBOUNCE_MS } from "@/configs/const";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface CategorySearchProps {
  categoryName: string;
  onSearch: (query: string) => void;
}

export function CategorySearch({ categoryName, onSearch }: CategorySearchProps) {
  const [value, setValue] = React.useState("");
  const debouncedQuery = useDebouncedValue(value.trim(), HERO_SEARCH_DEBOUNCE_MS);
  const label = `Search within ${categoryName}`;

  React.useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={label}
        aria-label={label}
        className="h-14 w-full rounded-full border border-surface-line bg-surface-card pl-11 pr-16 text-sm text-ink-1 outline-none transition-colors placeholder:text-ink-4 focus-visible:border-brand-green [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label={label}
        className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-brand-green text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
      >
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
