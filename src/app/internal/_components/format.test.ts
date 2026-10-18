import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOT_APPLICABLE } from "@/configs/const";
import { capitalize, formatCount, formatHours, formatPct, formatTimeAgo } from "./format";

describe("internal dashboard formatters", () => {
  it("formats counts", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1500)).toBe((1500).toLocaleString());
    expect(formatCount(null)).toBe(NOT_APPLICABLE);
  });

  it("formats percentages with no decimals by default", () => {
    expect(formatPct(42.6)).toBe("43%");
    expect(formatPct(42.66, 1)).toBe("42.7%");
    expect(formatPct(undefined)).toBe(NOT_APPLICABLE);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    "does not render %s as a percentage",
    (value) => {
      expect(formatPct(value)).toBe(NOT_APPLICABLE);
    },
  );

  it("formats hours", () => {
    expect(formatHours(3)).toBe("3.0h");
    expect(formatHours(null)).toBe(NOT_APPLICABLE);
  });

  it("capitalizes the first letter only", () => {
    expect(capitalize("week")).toBe("Week");
    expect(capitalize("")).toBe("");
  });
});

describe("formatTimeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats relative times", () => {
    expect(formatTimeAgo("2026-10-12T12:00:00Z")).toBe("2 days ago");
  });

  it("returns N/A without a value", () => {
    expect(formatTimeAgo(null)).toBe(NOT_APPLICABLE);
    expect(formatTimeAgo("")).toBe(NOT_APPLICABLE);
  });
});
