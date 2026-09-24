"use client";

import { Info } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { JoinClicksMetrics } from "@/types/OwnerDashboard";
import { formatCount, formatDecimal, formatPct } from "./format";
import { ReportCard } from "./ReportCard";

interface JoinConversionReportProps {
  metrics?: JoinClicksMetrics;
  dataAsOf?: string | null;
  periodLabel: string;
  loading?: boolean;
}

interface Metric {
  label: string;
  value: string;
  detail: string;
  help: string;
  primary?: boolean;
}

function MetricTile({ metric, loading }: { metric: Metric; loading: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg px-4 py-3",
        metric.primary ? "bg-brand-soft" : "bg-surface-stripe",
      )}
    >
      <span className="flex items-center gap-1.5">
        <Typography
          variant="tiny"
          as="span"
          className="font-mono tracking-[0.08em] text-ink-3 uppercase"
        >
          {metric.label}
        </Typography>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`About ${metric.label}`}
              className="cursor-help text-ink-4 hover:text-ink-2"
            >
              <Info className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{metric.help}</TooltipContent>
        </Tooltip>
      </span>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <Typography
          variant="large"
          as="span"
          className={cn(
            "text-2xl leading-none tabular-nums",
            metric.primary ? "text-brand-deep" : "text-ink-1",
          )}
        >
          {metric.value}
        </Typography>
      )}
      {loading ? (
        <Skeleton className="h-3 w-24" />
      ) : (
        <Typography variant="xs" as="span" className="text-ink-4">
          {metric.detail}
        </Typography>
      )}
    </div>
  );
}

export function JoinConversionReport({
  metrics,
  dataAsOf,
  periodLabel,
  loading = false,
}: JoinConversionReportProps) {
  const impressions = metrics?.searchImpressions ?? 0;
  const pageViews = metrics?.pageViews ?? 0;
  const joinClicks = metrics?.joinClicks ?? 0;

  const tiles: Metric[] = [
    {
      label: "Join clicks",
      value: formatCount(joinClicks),
      detail: "Join Group button clicks",
      help: "Total number of Join Group clicks on your group pages in the period.",
      primary: true,
    },
    {
      label: "Search CTR",
      value: formatPct(metrics?.searchCtr),
      detail: `${formatCount(impressions)} search impressions`,
      help: "Clicks from search results divided by search impressions. Shows how appealing your group is within search results.",
    },
    {
      label: "Page conversion rate",
      value: formatPct(metrics?.pageConversionRate),
      detail: `${formatCount(joinClicks)} joins · ${formatCount(pageViews)} views`,
      help: "Join clicks divided by page views. Shows how well your listing page convinces visitors to join.",
    },
    {
      label: "Average position",
      value: formatDecimal(metrics?.averagePosition),
      detail: "Across all search impressions",
      help: "Average place your group appeared at in search results. Lower is better.",
    },
  ];

  return (
    <ReportCard
      title="Join clicks & conversion"
      subtitle={`How visitors turn into members · ${periodLabel}`}
      dataAsOf={dataAsOf}
      loading={loading}
    >
      <div className="px-5">
        <TooltipProvider>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map((tile) => (
              <MetricTile key={tile.label} metric={tile} loading={loading} />
            ))}
          </div>
        </TooltipProvider>
      </div>
    </ReportCard>
  );
}
