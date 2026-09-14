import type { DashboardPeriod } from "@/types/Dashboard";

export const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "custom", label: "Custom" },
] as const;

export type Period = (typeof PERIOD_OPTIONS)[number]["value"];

export const DEFAULT_PERIOD: Period = "7d";

export const PERIOD_TO_API: Record<Period, DashboardPeriod> = {
  today: "TODAY",
  "7d": "LAST_7_DAYS",
  "30d": "LAST_30_DAYS",
  "90d": "LAST_90_DAYS",
  custom: "CUSTOM",
};

export const PERIOD_HINT_LABEL: Record<Period, string> = {
  today: "today",
  "7d": "this week",
  "30d": "last 30 days",
  "90d": "last 90 days",
  custom: "in range",
};

export interface PeriodSelection {
  period: Period;
  startDate?: string;
  endDate?: string;
}

export function overviewRequestKey(params: {
  period: DashboardPeriod;
  startDate?: string;
  endDate?: string;
}) {
  return [params.period, params.startDate, params.endDate].join("|");
}
