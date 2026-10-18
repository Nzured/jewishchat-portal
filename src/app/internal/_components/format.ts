import { NOT_APPLICABLE } from "@/configs/const";
import { timeAgo } from "@/lib/date";

function isMissing(value?: number | null): value is null | undefined {
  return value == null || !Number.isFinite(value);
}

export function formatCount(value?: number | null) {
  return isMissing(value) ? NOT_APPLICABLE : value.toLocaleString();
}

export function formatPct(value?: number | null, digits = 0) {
  return isMissing(value) ? NOT_APPLICABLE : `${value.toFixed(digits)}%`;
}

export function formatHours(value?: number | null) {
  return isMissing(value) ? NOT_APPLICABLE : `${value.toFixed(1)}h`;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatTimeAgo(value?: string | null) {
  return value ? timeAgo(value) : NOT_APPLICABLE;
}
