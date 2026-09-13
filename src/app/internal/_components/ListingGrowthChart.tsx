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
import { GrowthTrendDay } from "@/types/Dashboard";

export const SERIES = {
  published: { key: "published", label: "Listings published", color: "#0F6E5E" },
  submitted: { key: "submitted", label: "Listings submitted", color: "#3FB39A" },
} as const;

const AXIS_TICK = { fontSize: 11, fill: "#9AA8A2" };

interface ListingGrowthChartProps {
  data: GrowthTrendDay[];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-line bg-surface-card px-3 py-2 shadow-sm">
      <Typography variant="xs" className="mb-1 text-ink-3">
        {formatDate(label)}
      </Typography>
      {Object.values(SERIES).map((series) => {
        const entry = payload.find((item) => item.dataKey === series.key);
        return (
          <div key={series.key} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-ink-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: series.color }} />
              {series.label}
            </span>
            <span className="font-medium text-ink-1">{entry?.value ?? 0}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ListingGrowthChart({ data }: ListingGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="listing-published-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.published.color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={SERIES.published.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#0F1E1914" strokeDasharray="0" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(value: string) => formatDate(value, "ddd")}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          allowDecimals={false}
          width={48}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#0F1E1924" }} />
        <Area
          type="monotone"
          dataKey={SERIES.submitted.key}
          name={SERIES.submitted.label}
          stroke={SERIES.submitted.color}
          strokeWidth={2}
          strokeDasharray="4 3"
          fill="none"
          dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey={SERIES.published.key}
          name={SERIES.published.label}
          stroke={SERIES.published.color}
          strokeWidth={2}
          fill="url(#listing-published-fill)"
          dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#ffffff" }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
