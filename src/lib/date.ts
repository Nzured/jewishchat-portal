import dayjs, { type ConfigType } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const DEFAULT_DATE_FORMAT = "D MMM YYYY";
const DATE_KEY_FORMAT = "YYYY-MM-DD";

export function formatDate(date: ConfigType, format: string = DEFAULT_DATE_FORMAT) {
  return dayjs(date).format(format);
}

export function isValidDate(date: ConfigType) {
  return date != null && dayjs(date).isValid();
}

export function timeAgo(date: ConfigType) {
  return dayjs(date).fromNow();
}

export function formatDuration(ms: number) {
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "less than a minute";
}

export function toDateKey(date: Date) {
  return dayjs(date).format(DATE_KEY_FORMAT);
}

export function parseDateKey(value: string) {
  return dayjs(value, DATE_KEY_FORMAT).toDate();
}
