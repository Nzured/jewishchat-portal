"use client";

import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { NoData } from "@/components/ui/NoData";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import {
  SearchInsightsPage,
  SearchInsightsParams,
  SearchInsightsSortBy,
  SearchQueryInsight,
  SortDirection,
} from "@/types/SearchInsights";
import { InsightsToolbar, type InsightsToolbarTabProps, SortableHeader } from "./InsightsToolbar";
import { SearchQueryCard } from "./SearchQueryCard";
import { useExportInsights } from "./useExportInsights";
import { INSIGHTS_PAGE_SIZE_OPTIONS, useInsightsPage } from "./useInsightsPage";
import { formatCount, formatPct } from "../../_components/format";
import { type PeriodSelection } from "../../_components/PeriodToggle";

const DEFAULT_SORT = { sortBy: "SEARCHES" as const, sortDir: "DESC" as const };

interface AllQueriesTableProps extends InsightsToolbarTabProps {
  selection: PeriodSelection;
  onLoaded?: (data: SearchInsightsPage) => void;
}

const fetchAllQueries = (params: SearchInsightsParams) =>
  DashboardService.getSearchInsights(params);
const getRowKey = (row: SearchQueryInsight) => row.query ?? "";
const defaultDirFor = (sortBy: SearchInsightsSortBy): SortDirection =>
  sortBy === "QUERY" ? "ASC" : "DESC";

export function AllQueriesTable({ selection, onLoaded, ...tabProps }: AllQueriesTableProps) {
  const table = useInsightsPage<SearchQueryInsight, SearchInsightsSortBy>({
    selection,
    fetcher: fetchAllQueries,
    getKey: getRowKey,
    defaultSort: DEFAULT_SORT,
    defaultDirFor,
    onLoaded,
  });

  const { exportCsv, exporting } = useExportInsights({
    selection,
    sortBy: table.sortBy,
    sortDir: table.sortDir,
    zeroResultsOnly: false,
  });

  const sortHeader = (label: string, sortBy: SearchInsightsSortBy) => (
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
      cell: (row: SearchQueryInsight) => (
        <span className="flex flex-wrap items-center gap-2 text-ink-1">
          {row.query}
          {row.averageResultsReturned === 0 && (
            <Chip
              label="No results"
              shape="pill"
              type="warning"
              className="px-2 py-0.5 text-[10px]"
            />
          )}
        </span>
      ),
    },
    {
      id: "searches",
      header: sortHeader("Searches", "SEARCHES"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      cell: (row: SearchQueryInsight) => formatCount(row.searches),
    },
    {
      id: "results",
      header: sortHeader("Results returned (avg)", "AVERAGE_RESULTS_RETURNED"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      cell: (row: SearchQueryInsight) => formatCount(row.averageResultsReturned),
    },
    {
      id: "ctr",
      header: sortHeader("CTR", "CTR"),
      headerClassName: "text-right",
      cellClassName: "text-right font-mono",
      cell: (row: SearchQueryInsight) => formatPct(row.ctr),
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
        renderCard={(row) => <SearchQueryCard row={row} />}
        getRowId={(row, index) => row.query ?? String(index)}
        loading={table.loading}
        emptyState={
          <NoData
            title="No searches yet"
            description="Search queries will show up here once people start searching."
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
    </div>
  );
}
