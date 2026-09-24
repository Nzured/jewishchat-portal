"use client";

import * as React from "react";
import { FIRST_PAGE } from "@/configs/const";
import { OwnerDashboardService } from "@/services/dashboard/ownerDashboard.service";
import {
  OwnerDashboardParams,
  SearchPerformanceSortBy,
  SearchQueryPerformance,
} from "@/types/OwnerDashboard";
import { SortDirection } from "@/types/SearchInsights";

export const SEARCH_PAGE_SIZE = 10;
export const SEARCH_PAGE_SIZE_OPTIONS = [10, 20, 50];

const DEFAULT_SORT: SortState = { sortBy: "IMPRESSIONS", sortDir: "DESC" };
const DEFAULT_DIR: Record<SearchPerformanceSortBy, SortDirection> = {
  QUERY: "ASC",
  GROUP: "ASC",
  IMPRESSIONS: "DESC",
  CLICKS: "DESC",
  CTR: "DESC",
  AVERAGE_POSITION: "ASC",
};

interface SortState {
  sortBy: SearchPerformanceSortBy;
  sortDir: SortDirection;
}

const rowKey = (row: SearchQueryPerformance) => `${row.groupUuid}:${row.query}`;

function uniqueBy(list: SearchQueryPerformance[]) {
  const seen = new Set<string>();
  return list.filter((row) => {
    const key = rowKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function useSearchPerformance(params: OwnerDashboardParams | null) {
  const [sort, setSort] = React.useState<SortState>(DEFAULT_SORT);
  const [rows, setRows] = React.useState<SearchQueryPerformance[]>([]);
  const [mobileRows, setMobileRows] = React.useState<SearchQueryPerformance[]>([]);
  const [total, setTotal] = React.useState(0);
  const [dataAsOf, setDataAsOf] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [page, setPage] = React.useState(FIRST_PAGE);
  const [pageSize, setPageSize] = React.useState(SEARCH_PAGE_SIZE);
  const [retryTick, setRetryTick] = React.useState(0);

  const baseKey = [
    params?.period,
    params?.startDate ?? "",
    params?.endDate ?? "",
    params?.groupUuid ?? "",
    sort.sortBy,
    sort.sortDir,
    pageSize,
  ].join("|");
  const [lastBaseKey, setLastBaseKey] = React.useState(baseKey);
  if (lastBaseKey !== baseKey) {
    setLastBaseKey(baseKey);
    setPage(FIRST_PAGE);
    setMobileRows([]);
  }

  React.useEffect(() => {
    if (!params) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await OwnerDashboardService.getSearchPerformance({
          ...params!,
          sortBy: sort.sortBy,
          sortDir: sort.sortDir,
          page: page - 1,
          size: pageSize,
        });
        if (ignore || !res) return;
        const queries = uniqueBy(res.data.queries ?? []);
        setRows(queries);
        setTotal(res.data.totalQueries ?? 0);
        setDataAsOf(res.data.dataAsOf ?? null);
        setMobileRows((prev) => (page === FIRST_PAGE ? queries : uniqueBy([...prev, ...queries])));
      } catch {
        if (ignore) return;
        setRows([]);
        setTotal(0);
        setError(true);
        if (page === FIRST_PAGE) setMobileRows([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [baseKey, page, retryTick]);

  const sortByColumn = React.useCallback((sortBy: SearchPerformanceSortBy) => {
    setSort((current) =>
      current.sortBy === sortBy
        ? { sortBy, sortDir: current.sortDir === "DESC" ? "ASC" : "DESC" }
        : { sortBy, sortDir: DEFAULT_DIR[sortBy] },
    );
  }, []);

  const changePageSize = React.useCallback((size: number) => {
    setPageSize(size);
    setPage(FIRST_PAGE);
  }, []);

  const loadMore = React.useCallback(() => setPage((current) => current + 1), []);
  const retry = React.useCallback(() => setRetryTick((tick) => tick + 1), []);

  return {
    rows,
    mobileRows,
    total,
    dataAsOf,
    loading: loading && page === FIRST_PAGE,
    error,
    page,
    pageSize,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
    hasMore: page * pageSize < total,
    setPage,
    changePageSize,
    sortByColumn,
    loadMore,
    retry,
  };
}
