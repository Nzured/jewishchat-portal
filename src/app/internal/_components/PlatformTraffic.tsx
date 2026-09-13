import { Card } from "@/components/ui/Card";
import { Link } from "@/components/ui/Link";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { TrafficStats } from "@/types/Dashboard";
import { capitalize, formatCount } from "./format";

const TRAFFIC_SOURCES = [
  { key: "internalSearch", label: "Internal search", color: "#0F6E5E" },
  { key: "browse", label: "Browse / listings", color: "#3FB39A" },
  { key: "direct", label: "Direct", color: "#3D7BD6" },
  { key: "external", label: "External", color: "#C97A21" },
] as const;

interface PlatformTrafficProps {
  data?: TrafficStats;
  periodLabel: string;
  loading?: boolean;
}

export function PlatformTraffic({ data, periodLabel, loading = false }: PlatformTrafficProps) {
  const total = data?.totalPageViews ?? 0;
  const sources = TRAFFIC_SOURCES.map((source) => {
    const value = data?.[source.key] ?? 0;
    return { ...source, value, sharePct: total > 0 ? (value / total) * 100 : 0 };
  });
  const hasTraffic = Boolean(data) && total > 0;
  const rollups = [
    {
      label: "Platform-internal",
      value: data?.platformInternal ?? (data?.internalSearch ?? 0) + (data?.browse ?? 0),
    },
    { label: "Inbound", value: data?.inbound ?? (data?.direct ?? 0) + (data?.external ?? 0) },
  ].map((rollup) => ({ ...rollup, sharePct: total > 0 ? (rollup.value / total) * 100 : 0 }));

  return (
    <Card className="h-full gap-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5">
        <div className="flex flex-col gap-1">
          <Typography variant="h4" className="text-ink-1">
            Platform traffic
          </Typography>
          <Typography variant="muted">
            {capitalize(periodLabel)} · page views by source · bots excluded
          </Typography>
        </div>
        <Link href="/internal/search-insights" arrow className="shrink-0">
          Search insights
        </Link>
      </div>

      <div className="px-5">
        {loading ? (
          <Skeleton className="h-8 w-full" />
        ) : hasTraffic ? (
          <div className="flex h-8 gap-0.5" role="img" aria-label="Page views by source">
            {sources
              .filter((source) => source.value > 0)
              .map((source) => (
                <span
                  key={source.key}
                  className="rounded-[4px]"
                  style={{ width: `${source.sharePct}%`, backgroundColor: source.color }}
                  title={`${source.label}: ${formatCount(source.value)}`}
                />
              ))}
          </div>
        ) : (
          <div className="h-8 rounded-[4px] border border-dashed border-surface-line-strong" />
        )}
      </div>

      <div className="flex flex-col gap-3 px-5">
        {sources.map((source) => (
          <div key={source.key} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: source.color }}
                aria-hidden
              />
              <Typography variant="small" as="span" className="truncate text-ink-2">
                {source.label}
              </Typography>
            </span>
            {loading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="flex shrink-0 items-baseline gap-3">
                <Typography variant="small" as="span" className="font-medium text-ink-1">
                  {data ? formatCount(source.value) : NOT_APPLICABLE}
                </Typography>
                <Typography variant="xs" as="span" className="w-10 text-right font-mono text-ink-4">
                  {hasTraffic ? `${Math.round(source.sharePct)}%` : "—"}
                </Typography>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-surface-line px-5 pt-4">
        {rollups.map((rollup) => (
          <div key={rollup.label} className="flex flex-col gap-1">
            <Typography
              variant="tiny"
              as="span"
              className="font-mono tracking-[0.08em] text-ink-3 uppercase"
            >
              {rollup.label}
            </Typography>
            {loading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <span className="flex items-baseline gap-2">
                <Typography variant="small" as="span" className="font-medium text-ink-1">
                  {data ? formatCount(rollup.value) : NOT_APPLICABLE}
                </Typography>
                <Typography variant="xs" as="span" className="font-mono text-ink-4">
                  {hasTraffic ? `${Math.round(rollup.sharePct)}%` : "—"}
                </Typography>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-surface-line px-5 pt-4">
        <Typography variant="small" as="span" className="text-ink-2">
          Total page views
        </Typography>
        {loading ? (
          <Skeleton className="h-6 w-20" />
        ) : (
          <Typography variant="large" as="span" className="text-xl leading-none text-ink-1">
            {data ? formatCount(total) : NOT_APPLICABLE}
          </Typography>
        )}
      </div>
    </Card>
  );
}
