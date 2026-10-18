import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isNetworkSlow,
  reportRequestDuration,
  reportRequestTimeout,
  resetNetworkHealth,
  subscribeNetworkHealth,
} from "./networkHealth";

describe("networkHealth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetNetworkHealth();
  });
  afterEach(() => {
    resetNetworkHealth();
    vi.useRealTimers();
  });

  it("is not slow by default", () => {
    expect(isNetworkSlow()).toBe(false);
  });

  it("ignores fast requests", () => {
    reportRequestDuration(3999);
    expect(isNetworkSlow()).toBe(false);
  });

  it("marks the network slow after a slow request, for 20 seconds", () => {
    reportRequestDuration(4000);
    expect(isNetworkSlow()).toBe(true);
    vi.advanceTimersByTime(19_999);
    expect(isNetworkSlow()).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isNetworkSlow()).toBe(false);
  });

  it("extends the slow window on repeated slow requests", () => {
    reportRequestDuration(5000);
    vi.advanceTimersByTime(15_000);
    reportRequestDuration(5000);
    vi.advanceTimersByTime(15_000);
    expect(isNetworkSlow()).toBe(true);
  });

  it("notifies subscribers when entering and leaving the slow state", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeNetworkHealth(listener);

    reportRequestDuration(5000);
    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(20_000);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    reportRequestDuration(5000);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("treats a timeout as slow when online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    reportRequestTimeout();
    expect(isNetworkSlow()).toBe(true);
  });

  it("does not treat a timeout as slow when offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    reportRequestTimeout();
    expect(isNetworkSlow()).toBe(false);
  });

  it("reset clears the slow state and notifies", () => {
    const listener = vi.fn();
    subscribeNetworkHealth(listener);
    reportRequestDuration(5000);
    resetNetworkHealth();
    expect(isNetworkSlow()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
