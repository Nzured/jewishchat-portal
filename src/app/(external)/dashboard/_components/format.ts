import { NOT_APPLICABLE } from "@/configs/const";
import { formatDate } from "@/lib/date";
import { PageViewsByGroup, TrafficSource, TrafficSourceApi } from "@/types/OwnerDashboard";

export const NO_VALUE = NOT_APPLICABLE;

export const TRAFFIC_SOURCES: readonly {
  key: TrafficSource;
  label: string;
  color: string;
  description: string;
}[] = [
  {
    key: "internalSearch",
    label: "Internal Search",
    color: "var(--color-brand-deep)",
    description: "Arrived from the platform's own search results",
  },
  {
    key: "browse",
    label: "Browse / Listings",
    color: "var(--color-aurora-mid)",
    description: "Arrived from a category, city, or other listing page",
  },
  {
    key: "direct",
    label: "Direct",
    color: "var(--color-state-info)",
    description: "Arrived with no identifiable source, such as a shared or bookmarked link",
  },
  {
    key: "external",
    label: "External",
    color: "var(--color-state-warn)",
    description: "Arrived from a website outside the platform, such as Google or social media",
  },
];

export const ALL_TRAFFIC_SOURCES: TrafficSource[] = TRAFFIC_SOURCES.map((source) => source.key);

export const TRAFFIC_SOURCE_API: Record<TrafficSource, TrafficSourceApi> = {
  internalSearch: "INTERNAL_SEARCH",
  browse: "BROWSE",
  direct: "DIRECT",
  external: "EXTERNAL",
};

export function toApiSources(sources: TrafficSource[]): TrafficSourceApi[] {
  return sources.map((source) => TRAFFIC_SOURCE_API[source]);
}

export function sumSources(row: PageViewsByGroup, sources: TrafficSource[]) {
  return sources.reduce((total, source) => total + (row[source] ?? 0), 0);
}

export function formatCount(value?: number | null) {
  return value == null ? NO_VALUE : value.toLocaleString();
}

export function formatPct(value?: number | null, digits = 1) {
  return value == null || !Number.isFinite(value) ? NO_VALUE : `${value.toFixed(digits)}%`;
}

export function formatDecimal(value?: number | null, digits = 1) {
  return value == null || !Number.isFinite(value) ? NO_VALUE : value.toFixed(digits);
}

export function formatDataAsOf(value?: string | null) {
  return value ? formatDate(value, "D MMM YYYY, HH:mm") : NO_VALUE;
}
