import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALL_GROUPS,
  DEFAULT_FILTERS,
  earliestCustomDateKey,
  isCustomRangeIncomplete,
  periodFileSuffix,
  requestKey,
  todayDateKey,
  toRequestParams,
  validateCustomRange,
} from "./dashboardFilters";

describe("toRequestParams", () => {
  it("maps the default filters", () => {
    expect(toRequestParams(DEFAULT_FILTERS)).toEqual({
      period: "LAST_7_DAYS",
      startDate: undefined,
      endDate: undefined,
      groupUuid: undefined,
    });
  });

  it("passes a specific group through", () => {
    expect(toRequestParams({ period: "30d", groupUuid: "g-1" })?.groupUuid).toBe("g-1");
  });

  it("drops stale custom dates when a preset period is selected", () => {
    expect(
      toRequestParams({
        period: "90d",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        groupUuid: ALL_GROUPS,
      }),
    ).toMatchObject({ period: "LAST_90_DAYS", startDate: undefined, endDate: undefined });
  });

  it("includes dates for a complete custom range", () => {
    expect(
      toRequestParams({
        period: "custom",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
        groupUuid: ALL_GROUPS,
      }),
    ).toMatchObject({ period: "CUSTOM", startDate: "2026-01-01", endDate: "2026-02-01" });
  });

  it("returns null for an incomplete custom range", () => {
    const filters = { period: "custom" as const, startDate: "2026-01-01", groupUuid: ALL_GROUPS };
    expect(isCustomRangeIncomplete(filters)).toBe(true);
    expect(toRequestParams(filters)).toBeNull();
  });
});

describe("requestKey", () => {
  it("differs when any parameter differs", () => {
    const base = { period: "CUSTOM" as const, startDate: "2026-01-01", endDate: "2026-01-31" };
    expect(requestKey(base)).not.toBe(requestKey({ ...base, endDate: "2026-02-01" }));
    expect(requestKey(base)).not.toBe(requestKey({ ...base, groupUuid: "g" }));
    expect(requestKey(base)).toBe(requestKey({ ...base }));
  });
});

describe("custom range validation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 14, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes today and the lookback limit", () => {
    expect(todayDateKey()).toBe("2026-10-14");
    expect(earliestCustomDateKey()).toBe("2025-06-14");
  });

  it("accepts a valid range", () => {
    expect(validateCustomRange("2026-10-01", "2026-10-14")).toBeNull();
    expect(validateCustomRange("2025-06-14", "2025-06-14")).toBeNull();
  });

  it("does not validate until both ends are set", () => {
    expect(validateCustomRange("", "2026-10-01")).toBeNull();
    expect(validateCustomRange("2026-10-01", "")).toBeNull();
  });

  it("rejects a reversed range", () => {
    expect(validateCustomRange("2026-10-10", "2026-10-01")).toBe("order");
  });

  it("rejects a start date beyond the lookback window", () => {
    expect(validateCustomRange("2025-06-13", "2026-10-01")).toBe("lookback");
  });

  it("rejects an end date in the future", () => {
    expect(validateCustomRange("2026-10-01", "2026-10-15")).toBe("future");
  });
});

describe("periodFileSuffix", () => {
  it("uses the API period for presets", () => {
    expect(periodFileSuffix({ period: "30d", groupUuid: ALL_GROUPS })).toBe("last_30_days");
  });

  it("uses the dates for a custom range", () => {
    expect(
      periodFileSuffix({
        period: "custom",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
        groupUuid: ALL_GROUPS,
      }),
    ).toBe("2026-01-01_2026-01-31");
  });
});
