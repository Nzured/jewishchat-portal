import { describe, expect, it } from "vitest";
import { normalizeSearchSort, SEARCH_SORT_DATE_ADDED, SEARCH_SORT_RELEVANCE } from "./searchSorting";

describe("normalizeSearchSort", () => {
  it("keeps supported values", () => {
    expect(normalizeSearchSort(SEARCH_SORT_RELEVANCE)).toBe(SEARCH_SORT_RELEVANCE);
    expect(normalizeSearchSort(SEARCH_SORT_DATE_ADDED)).toBe(SEARCH_SORT_DATE_ADDED);
  });

  it.each([null, undefined, "", "name,asc", "RELEVANCE"])(
    "falls back to relevance for %j",
    (value) => {
      expect(normalizeSearchSort(value)).toBe(SEARCH_SORT_RELEVANCE);
    },
  );
});
