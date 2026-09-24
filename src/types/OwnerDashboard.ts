import { DashboardPeriod } from "./Dashboard";
import { SortDirection } from "./SearchInsights";

export type TrafficSource = "internalSearch" | "browse" | "direct" | "external";

export type TrafficSourceApi = "INTERNAL_SEARCH" | "BROWSE" | "DIRECT" | "EXTERNAL";

export interface OwnerDashboardParams {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  groupUuid?: string;
}

export interface OwnerOverviewParams extends OwnerDashboardParams {
  sources?: TrafficSourceApi[];
}

export type SearchPerformanceSortBy =
  | "QUERY"
  | "GROUP"
  | "IMPRESSIONS"
  | "CLICKS"
  | "CTR"
  | "AVERAGE_POSITION";

export interface SearchPerformanceSortParams extends OwnerDashboardParams {
  sortBy?: SearchPerformanceSortBy;
  sortDir?: SortDirection;
}

export interface SearchPerformanceParams extends SearchPerformanceSortParams {
  page?: number;
  size?: number;
}

export interface InactiveGroupDetail {
  groupUuid: string;
  groupName: string;
  slug: string;
  reason: string;
}

export interface OwnerDashboardSummary {
  activeGroups: number;
  inactiveGroups: number;
  inactiveDetails: InactiveGroupDetail[];
  totalPageViews: number;
  totalJoinClicks: number;
}

export interface BrokenLinkAlert {
  show: boolean;
  unsuccessfulClicks: number;
}

export interface PageViewsDay {
  date: string;
  value: number;
}

export interface PageViewsByGroup {
  groupUuid: string;
  groupName: string;
  internalSearch: number;
  browse: number;
  direct: number;
  external: number;
  total: number;
}

export interface OwnerPageViews {
  daily: PageViewsDay[];
  byGroup: PageViewsByGroup[];
  total: number;
}

export interface JoinClicksMetrics {
  joinClicks: number;
  searchCtr: number | null;
  pageConversionRate: number | null;
  averagePosition: number | null;
  searchImpressions: number;
  pageViews: number;
}

export interface SearchQueryPerformance {
  query: string;
  groupUuid: string;
  groupName: string;
  impressions: number;
  clicks: number;
  ctr: number | null;
  averagePosition: number | null;
}

export interface SearchPerformanceResult {
  queries: SearchQueryPerformance[];
  totalQueries: number;
}

export type SearchPerformancePage = SearchPerformanceResult & {
  page?: number;
  pageSize?: number;
  dataAsOf?: string;
};

export interface OwnerDashboardOverview {
  empty: boolean;
  noActivityInPeriod: boolean;
  periodStart: string;
  periodEnd: string;
  dataAsOf: string;
  summary: OwnerDashboardSummary;
  brokenLinkAlert: BrokenLinkAlert | null;
  pageViews: OwnerPageViews;
  joinClicks: JoinClicksMetrics;
  searchPerformance: SearchPerformanceResult;
}

export interface OwnerGroupOption {
  uuid: string;
  name: string;
  editPath: string;
}
