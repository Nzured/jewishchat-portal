import { DashboardPeriod } from "./Dashboard";

export interface SearchQueryInsight {
  query: string;
  searches: number;
  averageResultsReturned: number;
  ctr: number;
}

export interface ZeroResultQuery {
  query: string;
  searches: number;
  lastSearchedAt: string;
}

export interface InsightsPage<T> {
  queries: T[];
  totalQueries: number;
  page: number;
  pageSize: number;
  dataAsOf: string;
}

export type SearchInsightsPage = InsightsPage<SearchQueryInsight> & {
  zeroResultQueries?: number;
};
export type ZeroResultsPage = InsightsPage<ZeroResultQuery>;

export type SearchInsightsSortBy = "QUERY" | "SEARCHES" | "AVERAGE_RESULTS_RETURNED" | "CTR";
export type ZeroResultsSortBy = "QUERY" | "ZERO_RESULTS" | "LAST_SEARCHED";
export type SortDirection = "ASC" | "DESC";

export interface InsightsPageParams {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  sortDir?: SortDirection;
  page?: number;
  size?: number;
}

export interface SearchInsightsParams extends InsightsPageParams {
  sortBy?: SearchInsightsSortBy;
}

export interface ZeroResultsParams extends InsightsPageParams {
  sortBy?: ZeroResultsSortBy;
}

export interface ExportSearchInsightsParams {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  zeroResultsOnly?: boolean;
  sortBy?: SearchInsightsSortBy;
  sortDir?: SortDirection;
}
