import dayjs, { type ConfigType } from "dayjs";

export const DEFAULT_DATE_FORMAT = "D MMM YYYY";
const DATE_KEY_FORMAT = "YYYY-MM-DD";

export function formatDate(date: ConfigType, format: string = DEFAULT_DATE_FORMAT) {
  return dayjs(date).format(format);
}

export function toDateKey(date: Date) {
  return dayjs(date).format(DATE_KEY_FORMAT);
}

export function parseDateKey(value: string) {
  return dayjs(value, DATE_KEY_FORMAT).toDate();
}
