"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { TabsHeader } from "@/components/ui/TabsHeader";
import { cn } from "@/lib/utils";
import { SortDirection } from "@/types/SearchInsights";

export const INSIGHTS_TABS = { all: "all", zero: "zero" } as const;
export type InsightsTab = (typeof INSIGHTS_TABS)[keyof typeof INSIGHTS_TABS];

export interface InsightsToolbarTabProps {
  tab: InsightsTab;
  onTabChange: (tab: InsightsTab) => void;
  zeroResultCount?: number;
}

interface InsightsToolbarProps extends InsightsToolbarTabProps {
  onExport: () => void;
  exportDisabled?: boolean;
}

export function InsightsToolbar({
  tab,
  onTabChange,
  zeroResultCount,
  onExport,
  exportDisabled = false,
}: InsightsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Tabs value={tab} onValueChange={(value) => onTabChange(value as InsightsTab)}>
        <TabsHeader
          variant="pills"
          className="py-5"
          items={[
            { value: INSIGHTS_TABS.all, label: "All queries" },
            { value: INSIGHTS_TABS.zero, label: "Zero-result queries", count: zeroResultCount },
          ]}
        />
      </Tabs>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="size-4" />}
          onClick={onExport}
          disabled={exportDisabled}
        >
          Export CSV
        </Button>
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  active: boolean;
  sortDir: SortDirection;
  onSort: () => void;
}

export function SortableHeader({ label, active, sortDir, onSort }: SortableHeaderProps) {
  const Icon = active ? (sortDir === "DESC" ? ArrowDown : ArrowUp) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 uppercase hover:text-ink-1",
        active && "text-ink-1",
      )}
      aria-sort={active ? (sortDir === "DESC" ? "descending" : "ascending") : "none"}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className={cn("size-3", !active && "text-ink-4")} />
    </button>
  );
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
