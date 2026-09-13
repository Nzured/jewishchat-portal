"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { GrowthTrends, LiveGroupsByCategory } from "@/types/Dashboard";
import { ChartLegend } from "./ChartLegend";
import { capitalize, formatCount, formatPct } from "./format";
import { SERIES } from "./ListingGrowthChart";
import { MiniStat } from "./MiniStat";

const ListingGrowthChart = dynamic(
  () => import("./ListingGrowthChart").then((mod) => mod.ListingGrowthChart),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full" /> },
);

export const ALL_CATEGORIES = "all";

interface ListingGrowthProps {
  data?: GrowthTrends;
  periodLabel: string;
  categories: LiveGroupsByCategory[];
  categorySlug: string;
  onCategoryChange: (slug: string) => void;
  loading?: boolean;
}

export function ListingGrowth({
  data,
  periodLabel,
  categories,
  categorySlug,
  onCategoryChange,
  loading = false,
}: ListingGrowthProps) {
  const stats = [
    { label: "Submitted", value: formatCount(data?.listingsSubmitted) },
    { label: "Published", value: formatCount(data?.listingsPublished) },
    { label: "Approval rate", value: formatPct(data?.approvalRatePct) },
    { label: "New users", value: formatCount(data?.newUserRegistrations) },
  ];

  const categoryItems = [
    { label: "All categories", value: ALL_CATEGORIES },
    ...categories.map((category) => ({
      label: category.categoryName,
      value: category.categorySlug,
    })),
  ];

  const daily = data?.daily ?? [];

  return (
    <Card className="h-full gap-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-ink-1">
            Listing growth
          </Typography>
          <Typography variant="muted">
            {capitalize(periodLabel)} · submissions vs published
          </Typography>
        </div>
        <SelectDropdown
          size="sm"
          items={categoryItems}
          value={categorySlug}
          onValueChange={onCategoryChange}
          className="w-auto"
          aria-label="Filter by category"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <MiniStat key={stat.label} {...stat} loading={loading} />
        ))}
      </div>

      <div className="px-5">
        {loading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : daily.length > 0 ? (
          <ListingGrowthChart data={daily} />
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-surface-line-strong">
            <Typography variant="muted">No listing activity {periodLabel}.</Typography>
          </div>
        )}
      </div>

      <div className="px-5">
        <ChartLegend items={Object.values(SERIES)} />
      </div>
    </Card>
  );
}
