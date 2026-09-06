import { Group, GroupStatus } from "./Group";
import { UserRef, UserSummary } from "./User";

export enum ReportCategories {
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  LINK_NOT_WORKING = "LINK_NOT_WORKING",
  RESUBMISSION_MESSAGE = "RESUBMISSION_MESSAGE",
}

export const REPORT_CATEGORY_LABELS: Record<ReportCategories, string> = {
  [ReportCategories.INAPPROPRIATE_CONTENT]: "Inappropriate content",
  [ReportCategories.LINK_NOT_WORKING]: "Link not working",
  [ReportCategories.RESUBMISSION_MESSAGE]: "Resubmission message",
};

export const REPORT_CATEGORY_OPTIONS = Object.values(ReportCategories).map((category) => ({
  value: category,
  label: REPORT_CATEGORY_LABELS[category],
}));

export interface Report {
  id: number;
  reportedBy: UserRef;
  reason: ReportCategories;
  reportedDate: string;
  description: string;
  group: Group;
  reviewed?: boolean;
}

export interface ReportGroupPayload {
  category: ReportCategories;
  description?: string;
}

export interface AdminGroupReport {
  id: number;
  group: Group;
  reporterUuid: string;
  category: ReportCategories;
  description: string;
  resolved: boolean;
  createdAt: string;
}

export interface AdminGroupReportsPage {
  totalElements: number;
  totalPages: number;
  reports: AdminGroupReport[];
}

export interface ReportDetailGroup {
  uuid: string;
  slug: string;
  name: string;
  thumbnailUrl?: string | null;
  status: GroupStatus;
  memberCount?: number;
  createdOn?: string;
  submittedByUuid?: string;
  owner?: UserSummary;
}

export interface ReportDetail {
  id: number;
  group: ReportDetailGroup;
  reporterUuid: string;
  reporter?: UserSummary;
  category: ReportCategories;
  description: string;
  resolved: boolean;
  createdAt: string;
}

export interface ReportDetailResponse {
  report: ReportDetail;
  allGroupReports: ReportDetail[];
}

export type ReportThresholds = Partial<Record<ReportCategories, number>>;

export interface ReportThresholdEntry {
  category: ReportCategories;
  thresholdValue: number;
}

export type ReportThresholdsResponse = ReportThresholdEntry[];

export interface UpdateReportThresholdsPayload {
  thresholds: Record<string, number>;
}
