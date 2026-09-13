"use client";

import { Lightbulb } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { DataTable } from "@/components/ui/DataTable";
import { NoData } from "@/components/ui/NoData";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import {
  SortDirection,
  ZeroResultQuery,
  ZeroResultsPage,
  ZeroResultsParams,
  ZeroResultsSortBy,
} from "@/types/SearchInsights";
import { InsightsToolbar, type InsightsToolbarTabProps, SortableHeader } from "./InsightsToolbar";
import { useExportInsights } from "./useExportInsights";
import { INSIGHTS_PAGE_SIZE_OPTIONS, useInsightsPage } from "./useInsightsPage";
import { ZeroResultQueryCard } from "./ZeroResultQueryCard";
import { formatCount, formatTimeAgo } from "../../_components/format";
import { type PeriodSelection } from "../../_components/PeriodToggle";

const DEFAULT_SORT = { sortBy: "ZERO_RESULTS" as const, sortDir: "DESC" as const };

interface ZeroResultsTableProps extends InsightsToolbarTabProps {
  selection: PeriodSelection;
  onLoaded?: (data: ZeroResultsPage) => void;
}

const fetchZeroResults = (params: ZeroResultsParams) =>
  DashboardService.getZeroResultQueries(params);
const getRowKey = (row: ZeroResultQuery) => row.query ?? "";
const defaultDirFor = (sortBy: ZeroResultsSortBy): SortDirection =>
  sortBy === "QUERY" ? "ASC" : "DESC";

export function ZeroResultsTable({ selection, onLoaded, ...tabProps }: ZeroResultsTableProps) {
  const table = useInsightsPage<ZeroResultQuery, ZeroResultsSortBy>({
    selection,
    fetcher: fetchZeroResults,
    getKey: getRowKey,
    defaultSort: DEFAULT_SORT,
    defaultDirFor,
    onLoaded,
  });

  const { exportCsv, exporting } = useExportInsights({
    selection,
    sortBy: "SEARCHES",
    sortDir: table.sortDir,
    zeroResultsOnly: true,
  });

  const sortHeader = (label: string, sortBy: ZeroResultsSortBy) => (
    <SortableHeader
      label={label}
      active={table.sortBy === sortBy}
      sortDir={table.sortDir}
      onSort={() => table.sortByColumn(sortBy)}
    />
  );

  const columns = [
    {
      id: "query",
      header: sortHeader("Query", "QUERY"),
      cellClassName: "text-ink-1",
      cell: (row: ZeroResultQuery) => row.query,
    },
    {
      id: "searches",
      header: sortHeader("Searches", "ZERO_RESULTS"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      cell: (row: ZeroResultQuery) => formatCount(row.searches),
    },
    {
      id: "lastSearched",
      header: sortHeader("Last searched", "LAST_SEARCHED"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono text-ink-3",
      cell: (row: ZeroResultQuery) => formatTimeAgo(row.lastSearchedAt),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <InsightsToolbar
        {...tabProps}
        onExport={() => void exportCsv()}
        exportDisabled={exporting || table.loading || table.total === 0}
      />
      <DataTable
        columns={columns}
        data={table.rows}
        cardData={table.mobileRows}
        renderCard={(row) => <ZeroResultQueryCard row={row} />}
        getRowId={(row, index) => row.query ?? String(index)}
        loading={table.loading}
        emptyState={
          <NoData
            title="No zero-result searches in this period"
            description="Every search in this period returned at least one result."
          />
        }
        pagination={{
          page: table.page,
          pageSize: table.pageSize,
          total: table.total,
          pageSizeOptions: INSIGHTS_PAGE_SIZE_OPTIONS,
          onPageChange: table.setPage,
          onPageSizeChange: table.changePageSize,
        }}
        infiniteScroll={{ hasMore: table.hasMore, onLoadMore: table.loadMore }}
      />
      <Banner
        variant="warning"
        icon={<Lightbulb className="size-4" />}
        description="Each recurring term with no results points to a missing category, location page or listing. Use this list to drive the content and SEO roadmap."
      />
    </div>
  );
}
