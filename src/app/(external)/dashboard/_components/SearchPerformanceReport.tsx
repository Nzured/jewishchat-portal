"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { LoadFailed } from "@/components/ui/LoadFailed";
import { NoData } from "@/components/ui/NoData";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { OwnerDashboardService } from "@/services/dashboard/ownerDashboard.service";
import {
  OwnerDashboardParams,
  SearchPerformanceSortBy,
  SearchQueryPerformance,
} from "@/types/OwnerDashboard";
import { SortDirection } from "@/types/SearchInsights";
import { downloadBlob } from "./csv";
import { formatCount, formatDecimal, formatPct } from "./format";
import { ReportCard } from "./ReportCard";
import { SEARCH_PAGE_SIZE_OPTIONS, useSearchPerformance } from "./useSearchPerformance";

function SortableHeader({
  label,
  active,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  active: boolean;
  sortDir: SortDirection;
  onSort: () => void;
  align?: "left" | "right";
}) {
  const Icon = active ? (sortDir === "DESC" ? ArrowDown : ArrowUp) : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 uppercase hover:text-ink-1",
        active && "text-ink-1",
        align === "right" && "flex-row-reverse",
      )}
      aria-sort={active ? (sortDir === "DESC" ? "descending" : "ascending") : "none"}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className={cn("size-3", !active && "text-ink-4")} />
    </button>
  );
}

function SearchQueryCard({ row, showGroup }: { row: SearchQueryPerformance; showGroup: boolean }) {
  const metrics = [
    { label: "Impressions", value: formatCount(row.impressions) },
    { label: "Clicks", value: formatCount(row.clicks) },
    { label: "CTR", value: formatPct(row.ctr) },
    { label: "Avg. position", value: formatDecimal(row.averagePosition) },
  ];
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <Typography variant="small" className="font-medium text-ink-1">
            {row.query}
          </Typography>
          {showGroup && (
            <Typography variant="xs" as="span" className="text-ink-3">
              {row.groupName}
            </Typography>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-1">
              <Typography
                variant="tiny"
                as="span"
                className="font-mono tracking-[0.08em] text-ink-3 uppercase"
              >
                {metric.label}
              </Typography>
              <Typography variant="small" as="span" className="font-mono text-ink-1">
                {metric.value}
              </Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface SearchPerformanceReportProps {
  params: OwnerDashboardParams | null;
  showGroup: boolean;
  periodLabel: string;
  exportSuffix: string;
  dataAsOf?: string | null;
}

export function SearchPerformanceReport({
  params,
  showGroup,
  periodLabel,
  exportSuffix,
  dataAsOf,
}: SearchPerformanceReportProps) {
  const table = useSearchPerformance(params);
  const [exporting, setExporting] = React.useState(false);

  const exportCsv = async () => {
    if (!params) return;
    setExporting(true);
    try {
      const blob = await OwnerDashboardService.exportSearchPerformance({
        ...params,
        sortBy: table.sortBy,
        sortDir: table.sortDir,
      });
      if (blob) downloadBlob(`search-performance-${exportSuffix}.csv`, blob);
    } catch {
      return;
    } finally {
      setExporting(false);
    }
  };

  const header = (
    label: string,
    sortBy: SearchPerformanceSortBy,
    align: "left" | "right" = "right",
  ) => (
    <SortableHeader
      label={label}
      active={table.sortBy === sortBy}
      sortDir={table.sortDir}
      onSort={() => table.sortByColumn(sortBy)}
      align={align}
    />
  );

  const columns: DataTableColumn<SearchQueryPerformance>[] = [
    {
      id: "query",
      header: header("Search query", "QUERY", "left"),
      cell: (row) => <span className="font-medium text-ink-1">{row.query}</span>,
    },
    ...(showGroup
      ? [
          {
            id: "group",
            header: header("Group", "GROUP", "left"),
            cell: (row: SearchQueryPerformance) => (
              <span className="text-ink-2">{row.groupName}</span>
            ),
          },
        ]
      : []),
    {
      id: "impressions",
      header: header("Impressions", "IMPRESSIONS"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono tabular-nums",
      cell: (row) => formatCount(row.impressions),
    },
    {
      id: "clicks",
      header: header("Clicks", "CLICKS"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono tabular-nums",
      cell: (row) => formatCount(row.clicks),
    },
    {
      id: "ctr",
      header: header("CTR", "CTR"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono tabular-nums",
      cell: (row) => formatPct(row.ctr),
    },
    {
      id: "averagePosition",
      header: header("Avg. position", "AVERAGE_POSITION"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono tabular-nums",
      cell: (row) => formatDecimal(row.averagePosition),
    },
  ];

  const card = (
    <ReportCard
      title="Search performance"
      subtitle={`Searches that surfaced your groups · ${periodLabel}`}
      dataAsOf={table.dataAsOf ?? dataAsOf}
      loading={table.loading}
      actions={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="size-4" />}
          onClick={() => void exportCsv()}
          disabled={exporting || table.loading || table.total === 0}
        >
          Export CSV
        </Button>
      }
    >
      <div className="px-5">
        {table.error ? (
          <LoadFailed
            className="py-6"
            title="We couldn't load search performance"
            description="Please try again in a moment."
            onRetry={table.retry}
          />
        ) : (
          <DataTable
            columns={columns}
            data={table.rows}
            cardData={table.mobileRows}
            getRowId={(row) => `${row.groupUuid}:${row.query}`}
            loading={table.loading}
            skeletonRowCount={5}
            renderCard={(row) => <SearchQueryCard row={row} showGroup={showGroup} />}
            emptyState={
              <NoData
                title="No searches in this period"
                description="Queries that surfaced your groups will show up here."
              />
            }
            pagination={{
              page: table.page,
              pageSize: table.pageSize,
              total: table.total,
              pageSizeOptions: SEARCH_PAGE_SIZE_OPTIONS,
              onPageChange: table.setPage,
              onPageSizeChange: table.changePageSize,
            }}
          />
        )}
      </div>
    </ReportCard>
  );

  return (
    <div className="flex flex-col gap-3">
      {card}
      {!table.error && table.total > 0 && (
        <div className="flex justify-center md:hidden">
          {table.hasMore ? (
            <Button variant="outline" size="sm" onClick={table.loadMore}>
              Load more queries
            </Button>
          ) : (
            <Typography variant="xs" as="span" className="text-ink-4">
              You have reached the end
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
