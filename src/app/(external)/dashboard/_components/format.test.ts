import { describe, expect, it } from "vitest";
import { NOT_APPLICABLE } from "@/configs/const";
import type { PageViewsByGroup } from "@/types/OwnerDashboard";
import {
  ALL_TRAFFIC_SOURCES,
  formatCount,
  formatDataAsOf,
  formatDecimal,
  formatPct,
  sumSources,
  toApiSources,
} from "./format";

describe("traffic sources", () => {
  it("lists every source once", () => {
    expect(ALL_TRAFFIC_SOURCES).toEqual(["internalSearch", "browse", "direct", "external"]);
  });

  it("maps sources to their API names in order", () => {
    expect(toApiSources(["direct", "internalSearch"])).toEqual(["DIRECT", "INTERNAL_SEARCH"]);
    expect(toApiSources([])).toEqual([]);
  });

  it("sums only the selected sources and treats missing values as zero", () => {
    const row = { internalSearch: 5, browse: 3, direct: 2 } as unknown as PageViewsByGroup;
    expect(sumSources(row, ["internalSearch", "browse"])).toBe(8);
    expect(sumSources(row, ALL_TRAFFIC_SOURCES)).toBe(10);
    expect(sumSources(row, [])).toBe(0);
  });
});

describe("formatCount", () => {
  it("formats numbers with grouping", () => {
    expect(formatCount(1234567)).toBe((1234567).toLocaleString());
    expect(formatCount(0)).toBe("0");
  });

  it.each([null, undefined, Number.NaN])("returns N/A for %s", (value) => {
    expect(formatCount(value)).toBe(NOT_APPLICABLE);
  });
});

describe("formatPct", () => {
  it("formats with one decimal by default", () => {
    expect(formatPct(12.345)).toBe("12.3%");
    expect(formatPct(0)).toBe("0.0%");
  });

  it("respects the digits argument", () => {
    expect(formatPct(12.345, 0)).toBe("12%");
  });

  it.each([null, undefined, Number.NaN, Number.POSITIVE_INFINITY])(
    "returns N/A for %s",
    (value) => {
      expect(formatPct(value)).toBe(NOT_APPLICABLE);
    },
  );
});

describe("formatDecimal", () => {
  it("formats with one decimal by default", () => {
    expect(formatDecimal(2.25)).toBe("2.3");
    expect(formatDecimal(3, 2)).toBe("3.00");
  });

  it.each([null, undefined, Number.NaN])("returns N/A for %s", (value) => {
    expect(formatDecimal(value)).toBe(NOT_APPLICABLE);
  });
});

describe("formatDataAsOf", () => {
  it("formats a timestamp with date and time", () => {
    expect(formatDataAsOf("2026-10-14T09:05:00")).toBe("14 Oct 2026, 09:05");
  });

  it.each([null, undefined, ""])("returns N/A for %s", (value) => {
    expect(formatDataAsOf(value)).toBe(NOT_APPLICABLE);
  });
});
