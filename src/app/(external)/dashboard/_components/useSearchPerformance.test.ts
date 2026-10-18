import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OwnerDashboardParams } from "@/types/OwnerDashboard";
import { useSearchPerformance } from "./useSearchPerformance";

const getSearchPerformance = vi.fn();

vi.mock("@/services/dashboard/ownerDashboard.service", () => ({
  OwnerDashboardService: {
    getSearchPerformance: (params: unknown) => getSearchPerformance(params),
  },
}));

function respond(params: { page: number }) {
  return Promise.resolve({
    data: {
      queries: [{ groupUuid: "g", query: `q${params.page}` }],
      totalQueries: 25,
      dataAsOf: "2026-10-14T00:00:00Z",
    },
  });
}

const PARAMS: OwnerDashboardParams = { period: "LAST_7_DAYS" };

describe("useSearchPerformance", () => {
  beforeEach(() => {
    getSearchPerformance.mockReset().mockImplementation(respond);
  });

  it("does not fetch without params", async () => {
    renderHook(() => useSearchPerformance(null));
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(getSearchPerformance).not.toHaveBeenCalled();
  });

  it("loads the first page with the default sort", async () => {
    const { result } = renderHook(() => useSearchPerformance(PARAMS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getSearchPerformance).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: "IMPRESSIONS", sortDir: "DESC", page: 0, size: 10 }),
    );
    expect(result.current).toMatchObject({ total: 25, hasMore: true, error: false });
  });

  it("uses each column's natural direction when switching columns", async () => {
    const { result } = renderHook(() => useSearchPerformance(PARAMS));
    act(() => result.current.sortByColumn("AVERAGE_POSITION"));
    expect(result.current.sortDir).toBe("ASC");
    act(() => result.current.sortByColumn("AVERAGE_POSITION"));
    expect(result.current.sortDir).toBe("DESC");
    act(() => result.current.sortByColumn("CTR"));
    expect(result.current.sortDir).toBe("DESC");
  });

  it("accumulates mobile rows and stops when everything is loaded", async () => {
    const { result } = renderHook(() => useSearchPerformance(PARAMS));
    await waitFor(() => expect(result.current.mobileRows).toHaveLength(1));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.mobileRows).toHaveLength(2));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.mobileRows).toHaveLength(3));
    expect(result.current.hasMore).toBe(false);
  });

  it("resets to page one when the filters change", async () => {
    const { result, rerender } = renderHook(({ params }) => useSearchPerformance(params), {
      initialProps: { params: PARAMS },
    });
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.page).toBe(2));

    getSearchPerformance.mockClear();
    rerender({ params: { period: "LAST_30_DAYS" } });
    await waitFor(() => expect(getSearchPerformance).toHaveBeenCalled());
    expect(getSearchPerformance.mock.calls.map(([p]) => (p as { page: number }).page)).toEqual([
      0,
    ]);
  });

  it("flags an error and can retry", async () => {
    getSearchPerformance.mockRejectedValueOnce(new Error("down"));
    const { result } = renderHook(() => useSearchPerformance(PARAMS));
    await waitFor(() => expect(result.current.error).toBe(true));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    expect(result.current.error).toBe(false);
  });
});
