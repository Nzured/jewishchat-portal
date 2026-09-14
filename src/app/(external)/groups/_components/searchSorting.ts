export const SEARCH_SORT_RELEVANCE = "relevance";
export const SEARCH_SORT_DATE_ADDED = "date_added";

export const GROUP_SEARCH_SORT_OPTIONS = [
  { label: "Relevance", value: SEARCH_SORT_RELEVANCE },
  { label: "Newest", value: SEARCH_SORT_DATE_ADDED },
];

const SEARCH_SORT_VALUES = new Set<string>(GROUP_SEARCH_SORT_OPTIONS.map((option) => option.value));

export function normalizeSearchSort(value: string | null | undefined): string {
  return value && SEARCH_SORT_VALUES.has(value) ? value : SEARCH_SORT_RELEVANCE;
}
