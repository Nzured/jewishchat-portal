import dayjs from "dayjs";
import { OWNER_DASHBOARD_MAX_LOOKBACK_MONTHS } from "@/configs/const";
import { toDateKey } from "@/lib/date";
import type { DashboardPeriod } from "@/types/Dashboard";
import type { OwnerDashboardParams } from "@/types/OwnerDashboard";

export const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
] as const;

export type Period = (typeof PERIOD_OPTIONS)[number]["value"];

export const DEFAULT_PERIOD: Period = "7d";

export const ALL_GROUPS = "all";

export const PERIOD_TO_API: Record<Period, DashboardPeriod> = {
  "7d": "LAST_7_DAYS",
  "30d": "LAST_30_DAYS",
  "90d": "LAST_90_DAYS",
  custom: "CUSTOM",
};

export const PERIOD_HINT_LABEL: Record<Period, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
  custom: "selected range",
};

export const PERIOD_COMPARE_LABEL: Record<Period, string> = {
  "7d": "previous 7 days",
  "30d": "previous 30 days",
  "90d": "previous 90 days",
  custom: "previous period",
};

export interface DashboardFilters {
  period: Period;
  startDate?: string;
  endDate?: string;
  groupUuid: string;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  period: DEFAULT_PERIOD,
  groupUuid: ALL_GROUPS,
};

export function isCustomRangeIncomplete(filters: DashboardFilters) {
  return filters.period === "custom" && (!filters.startDate || !filters.endDate);
}

export function toRequestParams(filters: DashboardFilters): OwnerDashboardParams | null {
  if (isCustomRangeIncomplete(filters)) return null;
  return {
    period: PERIOD_TO_API[filters.period],
    startDate: filters.period === "custom" ? filters.startDate : undefined,
    endDate: filters.period === "custom" ? filters.endDate : undefined,
    groupUuid: filters.groupUuid === ALL_GROUPS ? undefined : filters.groupUuid,
  };
}

export function requestKey(params: OwnerDashboardParams) {
  return [params.period, params.startDate, params.endDate, params.groupUuid].join("|");
}

export function earliestCustomDateKey() {
  return toDateKey(dayjs().subtract(OWNER_DASHBOARD_MAX_LOOKBACK_MONTHS, "month").toDate());
}

export function todayDateKey() {
  return toDateKey(new Date());
}

export type CustomRangeError = "order" | "lookback" | "future";

export function validateCustomRange(start: string, end: string): CustomRangeError | null {
  if (!start || !end) return null;
  if (start > end) return "order";
  if (start < earliestCustomDateKey()) return "lookback";
  if (end > todayDateKey()) return "future";
  return null;
}

export const CUSTOM_RANGE_ERROR_MESSAGE: Record<CustomRangeError, string> = {
  order: "Start date must not be after end date.",
  lookback: `Custom ranges can look back at most ${OWNER_DASHBOARD_MAX_LOOKBACK_MONTHS} months.`,
  future: "End date cannot be in the future.",
};

export function periodFileSuffix(filters: DashboardFilters) {
  if (filters.period === "custom" && filters.startDate && filters.endDate) {
    return `${filters.startDate}_${filters.endDate}`;
  }
  return PERIOD_TO_API[filters.period].toLowerCase();
}
