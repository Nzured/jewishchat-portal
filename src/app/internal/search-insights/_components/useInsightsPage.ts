"use client";

import * as React from "react";
import { FIRST_PAGE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import { InsightsPage, InsightsPageParams, SortDirection } from "@/types/SearchInsights";
import { type PeriodSelection, PERIOD_TO_API } from "../../_components/PeriodToggle";

export const INSIGHTS_PAGE_SIZE = 50;
export const INSIGHTS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface SortState<S extends string> {
  sortBy: S;
  sortDir: SortDirection;
}

interface UseInsightsPageOptions<T, S extends string> {
  selection: PeriodSelection;
  fetcher: (
    params: InsightsPageParams & SortState<S>,
  ) => Promise<ApiResponse<InsightsPage<T>> | undefined>;
  getKey: (row: T) => string;
  defaultSort: SortState<S>;
  defaultDirFor?: (sortBy: S) => SortDirection;
  onLoaded?: (data: InsightsPage<T>) => void;
}

function uniqueBy<T>(list: T[], getKey: (row: T) => string) {
  const seen = new Set<string>();
  return list.filter((row) => {
    const key = getKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function useInsightsPage<T, S extends string>({
  selection,
  fetcher,
  getKey,
  defaultSort,
  defaultDirFor,
  onLoaded,
}: UseInsightsPageOptions<T, S>) {
  const [sort, setSort] = React.useState<SortState<S>>(defaultSort);
  const [rows, setRows] = React.useState<T[]>([]);
  const [mobileRows, setMobileRows] = React.useState<T[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(FIRST_PAGE);
  const [pageSize, setPageSize] = React.useState(INSIGHTS_PAGE_SIZE);

  const baseKey = [
    selection.period,
    selection.startDate ?? "",
    selection.endDate ?? "",
    sort.sortBy,
    sort.sortDir,
    pageSize,
  ].join("|");
  const lastBaseKey = React.useRef(baseKey);

  React.useEffect(() => {
    if (lastBaseKey.current === baseKey) return;
    lastBaseKey.current = baseKey;
    setPage(FIRST_PAGE);
    setMobileRows([]);
  }, [baseKey]);

  const params = React.useMemo<(InsightsPageParams & SortState<S>) | null>(() => {
    if (selection.period === "custom" && (!selection.startDate || !selection.endDate)) return null;
    return {
      period: PERIOD_TO_API[selection.period],
      startDate: selection.startDate,
      endDate: selection.endDate,
      sortBy: sort.sortBy,
      sortDir: sort.sortDir,
      page: page - 1,
      size: pageSize,
    };
  }, [selection, sort, page, pageSize]);

  React.useEffect(() => {
    if (!params) return;

    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetcher(params as InsightsPageParams & SortState<S>);
        if (ignore || !res) return;
        const queries = uniqueBy(res.data.queries ?? [], getKey);
        setRows(queries);
        setTotal(res.data.totalQueries ?? 0);
        setMobileRows((prev) =>
          page === FIRST_PAGE ? queries : uniqueBy([...prev, ...queries], getKey),
        );
        onLoaded?.(res.data);
      } catch {
        if (ignore) return;
        setRows([]);
        setTotal(0);
        if (page === FIRST_PAGE) setMobileRows([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [params, page, fetcher, getKey, onLoaded]);

  const sortByColumn = React.useCallback(
    (sortBy: S) => {
      setSort((current) => {
        if (current.sortBy === sortBy) {
          return { sortBy, sortDir: current.sortDir === "DESC" ? "ASC" : "DESC" };
        }
        return { sortBy, sortDir: defaultDirFor?.(sortBy) ?? "DESC" };
      });
    },
    [defaultDirFor],
  );

  const changePageSize = React.useCallback((size: number) => {
    setPageSize(size);
    setPage(FIRST_PAGE);
  }, []);

  const loadMore = React.useCallback(() => setPage((current) => current + 1), []);

  return {
    rows,
    mobileRows,
    total,
    loading: loading && page === FIRST_PAGE,
    page,
    pageSize,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
    hasMore: page * pageSize < total,
    setPage,
    changePageSize,
    sortByColumn,
    loadMore,
  };
}
