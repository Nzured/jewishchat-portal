"use client";

import * as React from "react";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { EXTERNAL_GROUPS_PATH } from "@/configs/const";

interface CategorySearchProps {
  categoryName: string;
  categorySlug: string;
}

export function CategorySearch({ categoryName, categorySlug }: CategorySearchProps) {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const label = `Search within ${categoryName}`;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({ category: categorySlug });
    const query = value.trim();
    if (query) params.set("q", query);
    router.push(`${EXTERNAL_GROUPS_PATH}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={label}
        aria-label={label}
        className="h-14 w-full rounded-full border border-surface-line bg-surface-card pl-11 pr-16 text-sm text-ink-1 outline-none transition-colors placeholder:text-ink-4 focus-visible:border-brand-green"
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
