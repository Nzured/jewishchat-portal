"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Typography } from "@/components/ui/Typography";
import { formatDate } from "@/lib/date";
import { PageViewsDay, TrafficSource } from "@/types/OwnerDashboard";
import { formatCount, TRAFFIC_SOURCES } from "./format";

const AXIS_TICK = { fontSize: 11, fill: "var(--color-ink-4)" };
const COMPACT_TICK_DAYS = 10;
const TOTAL_COLOR = "var(--color-ink-2)";

function ChartTooltip({
  active,
  payload,
  label,
  seriesLabel,
  seriesColor,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
  seriesLabel: string;
  seriesColor: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-line bg-surface-card px-3 py-2 shadow-sm">
      <Typography variant="xs" className="mb-1 text-ink-3">
        {formatDate(label)}
      </Typography>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="flex items-center gap-2 text-ink-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: seriesColor }} />
          {seriesLabel}
        </span>
        <span className="font-medium text-ink-1 tabular-nums">
          {formatCount(payload[0]?.value ?? 0)}
        </span>
      </div>
    </div>
  );
}

export function PageViewsChart({
  data,
  sources,
}: {
  data: PageViewsDay[];
  sources: TrafficSource[];
}) {
  const compact = data.length <= COMPACT_TICK_DAYS;
  const onlySource =
    sources.length === 1 ? TRAFFIC_SOURCES.find((source) => source.key === sources[0]) : undefined;
  const seriesColor = onlySource?.color ?? TOTAL_COLOR;
  const seriesLabel = onlySource?.label ?? "Page views";

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="owner-page-views-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={seriesColor} stopOpacity={0.18} />
            <stop offset="100%" stopColor={seriesColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-surface-line)" strokeDasharray="0" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(value: string) => formatDate(value, compact ? "ddd D" : "D MMM")}
          minTickGap={28}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          allowDecimals={false}
          width={48}
        />
        <Tooltip
          content={<ChartTooltip seriesLabel={seriesLabel} seriesColor={seriesColor} />}
          cursor={{ stroke: "var(--color-surface-line-strong)" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={seriesLabel}
          stroke={seriesColor}
          strokeWidth={2}
          fill="url(#owner-page-views-fill)"
          dot={{ r: 3, fill: "var(--color-surface-card)", strokeWidth: 2 }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-surface-card)" }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
