"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Typography } from "@/components/ui/Typography";
import { formatDate } from "@/lib/date";
import { ReportsDay } from "@/types/Dashboard";

export const REPORT_SERIES = {
  received: { key: "received", label: "Received", color: "#0F6E5E" },
  resolved: { key: "resolved", label: "Resolved", color: "#3FB39A" },
} as const;

const AXIS_TICK = { fontSize: 11, fill: "#9AA8A2" };

interface UserReportsChartProps {
  data: ReportsDay[];
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
      {Object.values(REPORT_SERIES).map((series) => {
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

export function UserReportsChart({ data }: UserReportsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barGap={2}>
        <CartesianGrid vertical={false} stroke="#0F1E1914" strokeDasharray="0" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(value: string) => formatDate(value, "ddd")}
          minTickGap={16}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          allowDecimals={false}
          width={48}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "#0F1E1908" }} />
        {Object.values(REPORT_SERIES).map((series) => (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.label}
            fill={series.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={14}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
