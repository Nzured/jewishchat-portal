import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isNetworkSlow, reportRequestDuration, resetNetworkHealth } from "@/lib/networkHealth";
import { useNetworkStatus } from "./useNetworkStatus";

function stubConnection(connection: Partial<{ effectiveType: string; downlink: number }> | null) {
  const target = connection ? Object.assign(new EventTarget(), connection) : undefined;
  Object.defineProperty(navigator, "connection", { value: target, configurable: true });
  return target;
}

describe("useNetworkStatus", () => {
  let online = true;

  beforeEach(() => {
    online = true;
    vi.spyOn(navigator, "onLine", "get").mockImplementation(() => online);
    stubConnection(null);
    resetNetworkHealth();
  });
  afterEach(() => {
    resetNetworkHealth();
  });

  it("is online and fast by default", () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toEqual({ online: true, slow: false });
  });

  it.each([
    [{ effectiveType: "2g" }, true],
    [{ effectiveType: "slow-2g" }, true],
    [{ effectiveType: "4g", downlink: 0.3 }, true],
    [{ effectiveType: "4g", downlink: 10 }, false],
    [{ effectiveType: "4g", downlink: 0 }, false],
  ])("reads connection %j as slow=%s", (connection, slow) => {
    stubConnection(connection);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.slow).toBe(slow);
  });

  it("reports slow API calls", () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => reportRequestDuration(6000));
    expect(result.current.slow).toBe(true);
  });

  it("goes offline and never reports slow while offline", () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => reportRequestDuration(6000));
    online = false;
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toEqual({ online: false, slow: false });
  });

  it("clears the slow state on reconnect", () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => reportRequestDuration(6000));
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(isNetworkSlow()).toBe(false);
    expect(result.current).toEqual({ online: true, slow: false });
  });

  it("reacts to connection changes", () => {
    const connection = stubConnection({ effectiveType: "4g", downlink: 10 })!;
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      Object.assign(connection, { effectiveType: "2g" });
      connection.dispatchEvent(new Event("change"));
    });
    expect(result.current.slow).toBe(true);
  });
});
