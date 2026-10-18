import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { overviewRequestKey, validatePeriodRange } from "./dashboardPeriod";

describe("validatePeriodRange", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 15, 12));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits until both dates are set", () => {
    expect(validatePeriodRange("", "2026-10-01")).toBeNull();
    expect(validatePeriodRange("2026-10-01", "")).toBeNull();
  });

  it("accepts a range ending today", () => {
    expect(validatePeriodRange("2026-10-01", "2026-10-15")).toBeNull();
    expect(validatePeriodRange("2026-10-15", "2026-10-15")).toBeNull();
  });

  it("rejects a reversed range", () => {
    expect(validatePeriodRange("2026-10-10", "2026-10-01")).toBe("order");
  });

  it("rejects an end date in the future", () => {
    expect(validatePeriodRange("2026-10-01", "2026-10-16")).toBe("future");
  });
});

describe("overviewRequestKey", () => {
  it("distinguishes different custom ranges", () => {
    expect(
      overviewRequestKey({ period: "CUSTOM", startDate: "2026-01-01", endDate: "2026-01-31" }),
    ).not.toBe(
      overviewRequestKey({ period: "CUSTOM", startDate: "2026-01-01", endDate: "2026-02-01" }),
    );
  });
});
