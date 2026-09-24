"use client";

import * as React from "react";
import { BarChart3, Download, Table2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { OwnerDashboardService } from "@/services/dashboard/ownerDashboard.service";
import {
  OwnerDashboardParams,
  OwnerPageViews,
  PageViewsByGroup,
  TrafficSource,
} from "@/types/OwnerDashboard";
import { downloadBlob } from "./csv";
import { formatCount, toApiSources, TRAFFIC_SOURCES } from "./format";
import { ReportCard } from "./ReportCard";

const PageViewsChart = dynamic(() => import("./PageViewsChart").then((mod) => mod.PageViewsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[240px] w-full" />,
});

type View = "chart" | "table";

interface PageViewsReportProps {
  params: OwnerDashboardParams | null;
  pageViews?: OwnerPageViews;
  sources: TrafficSource[];
  onSourcesChange: (sources: TrafficSource[]) => void;
  dataAsOf?: string | null;
  periodLabel: string;
  exportSuffix: string;
  loading?: boolean;
}

function SourceToggles({
  sources,
  onChange,
}: {
  sources: TrafficSource[];
  onChange: (sources: TrafficSource[]) => void;
}) {
  const toggle = (key: TrafficSource) => {
    const next = sources.includes(key)
      ? sources.filter((source) => source !== key)
      : [...sources, key];
    if (next.length > 0) onChange(next);
  };

  return (
    <div role="group" aria-label="Traffic sources" className="flex flex-wrap gap-2">
      {TRAFFIC_SOURCES.map((source) => {
        const on = sources.includes(source.key);
        return (
          <Chip
            key={source.key}
            shape="pill"
            role="checkbox"
            aria-checked={on}
            title={source.description}
            type={on ? "active" : "neutral"}
            className={cn(!on && "opacity-70")}
            leftIcon={
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: on ? source.color : "var(--color-ink-4)" }}
                aria-hidden
              />
            }
            label={source.label}
            onClick={() => toggle(source.key)}
          />
        );
      })}
    </div>
  );
}

function GroupViewsCard({ row, sources }: { row: PageViewsByGroup; sources: TrafficSource[] }) {
  const visible = TRAFFIC_SOURCES.filter((source) => sources.includes(source.key));
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Typography variant="small" className="truncate font-medium text-ink-1">
            {row.groupName}
          </Typography>
          <Typography variant="small" className="shrink-0 font-semibold text-ink-1 tabular-nums">
            {formatCount(row.total)}
          </Typography>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {visible.map((source) => (
            <div key={source.key} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: source.color }}
                  aria-hidden
                />
                <Typography variant="xs" as="span" className="truncate text-ink-3">
                  {source.label}
                </Typography>
              </span>
              <Typography variant="xs" as="span" className="font-mono text-ink-1">
                {formatCount(row[source.key])}
              </Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PageViewsReport({
  params,
  pageViews,
  sources,
  onSourcesChange,
  dataAsOf,
  periodLabel,
  exportSuffix,
  loading = false,
}: PageViewsReportProps) {
  const [view, setView] = React.useState<View>("chart");
  const [exporting, setExporting] = React.useState(false);

  const daily = pageViews?.daily ?? [];
  const tableRows = React.useMemo(
    () => [...(pageViews?.byGroup ?? [])].sort((a, b) => b.total - a.total),
    [pageViews],
  );
  const total = pageViews?.total ?? 0;

  const columns = React.useMemo<DataTableColumn<PageViewsByGroup>[]>(() => {
    const sourceColumns = TRAFFIC_SOURCES.filter((source) => sources.includes(source.key)).map(
      (source): DataTableColumn<PageViewsByGroup> => ({
        id: source.key,
        header: (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: source.color }}
              aria-hidden
            />
            {source.label}
          </span>
        ),
        headerClassName: "text-right",
        cellClassName: "text-right font-mono tabular-nums",
        cell: (row) => formatCount(row[source.key]),
      }),
    );

    return [
      {
        id: "group",
        header: "Group",
        cell: (row) => <span className="font-medium text-ink-1">{row.groupName}</span>,
      },
      ...sourceColumns,
      {
        id: "total",
        header: "Total views",
        headerClassName: "text-right",
        cellClassName: "text-right font-mono font-semibold tabular-nums text-ink-1",
        cell: (row) => formatCount(row.total),
      },
    ];
  }, [sources]);

  const exportCsv = async () => {
    if (!params) return;
    setExporting(true);
    try {
      const blob = await OwnerDashboardService.exportPageViews({
        ...params,
        sources: toApiSources(sources),
      });
      if (blob) downloadBlob(`page-views-${exportSuffix}.csv`, blob);
    } catch {
      return;
    } finally {
      setExporting(false);
    }
  };

  return (
    <ReportCard
      title="Page views"
      subtitle={`Visits to your group pages · ${periodLabel} · bots excluded`}
      dataAsOf={dataAsOf}
      loading={loading}
      actions={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="size-4" />}
          onClick={() => void exportCsv()}
          disabled={exporting || loading || tableRows.length === 0}
        >
          Export CSV
        </Button>
      }
    >
      <Tabs value={view} onValueChange={(value) => setView(value as View)} className="gap-4">
        <div className="flex flex-col gap-3 px-5 md:flex-row md:items-center md:justify-between">
          <SourceToggles sources={sources} onChange={onSourcesChange} />
          <div className="flex items-center gap-4 md:shrink-0">
            {!loading && (
              <Typography variant="small" as="span" className="text-ink-3">
                <span className="font-semibold text-ink-1 tabular-nums">{formatCount(total)}</span>{" "}
                views
              </Typography>
            )}
            <TabsList aria-label="View">
              <TabsTrigger value="chart" className="px-2.5">
                <BarChart3 />
                Chart
              </TabsTrigger>
              <TabsTrigger value="table" className="px-2.5">
                <Table2 />
                Table
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="chart" className="px-5">
          {loading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : daily.length === 0 ? (
            <NoData
              title="No views in this period"
              description="None of the selected sources brought visitors to your groups."
            />
          ) : (
            <PageViewsChart data={daily} sources={sources} />
          )}
        </TabsContent>

        <TabsContent value="table" className="px-5">
          <DataTable
            columns={columns}
            data={tableRows}
            getRowId={(row) => row.groupUuid}
            loading={loading}
            skeletonRowCount={3}
            renderCard={(row) => <GroupViewsCard row={row} sources={sources} />}
            emptyState={
              <NoData
                title="No views in this period"
                description="None of the selected sources brought visitors to your groups."
              />
            }
          />
        </TabsContent>
      </Tabs>
    </ReportCard>
  );
}
