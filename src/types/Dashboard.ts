export type DashboardPeriod = "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS" | "CUSTOM";

export interface DashboardOverviewParams {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  categorySlug?: string;
}

export interface ModerationOperationsStats {
  publishedToday: number;
  pendingReview: number;
  oldestPendingAge: string | null;
  unresolvedReports: number;
  oldestUnresolvedReportAge: string | null;
  brokenLinksDetected: number;
}

export interface AiPipelineStats {
  submissionsReceived: number;
  humanReviewedCount: number;
  overriddenCount: number;
}

export interface LiveGroupsByCategory {
  categoryName: string;
  categorySlug: string;
  liveGroups: number;
  sharePct: number;
  thin: boolean;
}

export interface GrowthSnapshot {
  totalLiveGroups: number;
  totalRegisteredUsers: number;
  groupOwners: number;
  members: number;
  categoriesWithLiveGroups: number;
  liveGroupsByCategory: LiveGroupsByCategory[];
  thinCategoryThreshold: number;
}

export interface GrowthTrendDay {
  date: string;
  submitted: number;
  published: number;
  registrations: number;
}

export interface GrowthTrends {
  listingsSubmitted: number;
  listingsPublished: number;
  approvalRatePct: number | null;
  newUserRegistrations: number;
  daily: GrowthTrendDay[];
}

export interface ReportsDay {
  date: string;
  received: number;
  resolved: number;
}

export interface ReportsStats {
  reportsReceived: number;
  reportsResolved: number;
  resolutionRatePct: number;
  medianHoursToResolve: number | null;
  daily: ReportsDay[];
}

export interface TrafficDay {
  date: string;
  pageViews: number;
}

export interface TrafficStats {
  totalPageViews: number;
  internalSearch: number;
  browse: number;
  direct: number;
  external: number;
  platformInternal: number;
  inbound: number;
  daily: TrafficDay[];
}

export interface DashboardOverview {
  periodStart: string;
  periodEnd: string;
  analyticsDataAsOf: string;
  moderationDataAsOf: string;
  moderationOperations: ModerationOperationsStats;
  aiPipeline: AiPipelineStats;
  growthSnapshot: GrowthSnapshot;
  growthTrends: GrowthTrends;
  reports: ReportsStats;
  traffic: TrafficStats;
}
