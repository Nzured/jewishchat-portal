import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDate, formatDuration, isValidDate, parseDateKey, timeAgo, toDateKey } from "./date";

describe("formatDate", () => {
  it("uses the default D MMM YYYY format", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("5 Jan 2026");
  });

  it("accepts a custom format", () => {
    expect(formatDate(new Date(2026, 0, 5, 14, 3), "YYYY-MM-DD HH:mm")).toBe("2026-01-05 14:03");
  });
});

describe("isValidDate", () => {
  it.each([null, undefined, "not a date"])("rejects %j", (value) => {
    expect(isValidDate(value)).toBe(false);
  });

  it("accepts ISO strings and Date objects", () => {
    expect(isValidDate("2026-10-14T10:00:00Z")).toBe(true);
    expect(isValidDate(new Date())).toBe(true);
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("describes past dates relative to now", () => {
    expect(timeAgo("2026-10-14T09:00:00Z")).toBe("3 hours ago");
  });
});

describe("formatDuration", () => {
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it.each([
    [0, "less than a minute"],
    [59_999, "less than a minute"],
    [MINUTE, "1m"],
    [59 * MINUTE, "59m"],
    [HOUR, "1h"],
    [HOUR + 5 * MINUTE, "1h 5m"],
    [DAY, "1d"],
    [DAY + 3 * HOUR + 59 * MINUTE, "1d 3h"],
    [3 * DAY, "3d"],
  ])("formatDuration(%d) -> %j", (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });
});

describe("date keys", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toDateKey(new Date(2026, 1, 3, 23, 59))).toBe("2026-02-03");
  });

  it("parses a key back to local midnight of the same day", () => {
    const date = parseDateKey("2026-02-03");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(3);
    expect(date.getHours()).toBe(0);
  });

  it("round-trips", () => {
    expect(toDateKey(parseDateKey("2024-02-29"))).toBe("2024-02-29");
  });
});
