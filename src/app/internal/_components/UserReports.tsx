"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { ReportsStats } from "@/types/Dashboard";
import { ChartLegend } from "./ChartLegend";
import { capitalize, formatCount, formatHours, formatPct } from "./format";
import { MiniStat } from "./MiniStat";
import { REPORT_SERIES } from "./UserReportsChart";

const UserReportsChart = dynamic(
  () => import("./UserReportsChart").then((mod) => mod.UserReportsChart),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full" /> },
);

interface UserReportsProps {
  data?: ReportsStats;
  periodLabel: string;
  loading?: boolean;
}

export function UserReports({ data, periodLabel, loading = false }: UserReportsProps) {
  const stats = [
    { label: "Received", value: formatCount(data?.reportsReceived) },
    { label: "Resolved", value: formatCount(data?.reportsResolved) },
    { label: "Resolution rate", value: formatPct(data?.resolutionRatePct) },
    { label: "Median to resolve", value: formatHours(data?.medianHoursToResolve) },
  ];

  const daily = data?.daily ?? [];

  return (
    <Card className="h-full gap-5 py-5">
      <div className="flex flex-col gap-1 px-5">
        <Typography variant="h4" className="text-ink-1">
          User reports
        </Typography>
        <Typography variant="muted">
          {capitalize(periodLabel)} · received against resolved, daily
        </Typography>
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
          <UserReportsChart data={daily} />
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-surface-line-strong">
            <Typography variant="muted">No reports {periodLabel}.</Typography>
          </div>
        )}
      </div>

      <div className="px-5">
        <ChartLegend items={Object.values(REPORT_SERIES)} />
      </div>
    </Card>
  );
}
