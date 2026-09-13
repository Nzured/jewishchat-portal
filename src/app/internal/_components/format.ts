import { NOT_APPLICABLE } from "@/configs/const";
import { timeAgo } from "@/lib/date";

export function formatCount(value?: number | null) {
  return value == null ? NOT_APPLICABLE : value.toLocaleString();
}

export function formatPct(value?: number | null, digits = 0) {
  return value == null ? NOT_APPLICABLE : `${value.toFixed(digits)}%`;
}

export function formatHours(value?: number | null) {
  return value == null ? NOT_APPLICABLE : `${value.toFixed(1)}h`;
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatTimeAgo(value?: string | null) {
  return value ? timeAgo(value) : NOT_APPLICABLE;
}
