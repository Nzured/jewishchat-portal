import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOwnerDashboard } from "./useOwnerDashboard";

const getOverview = vi.hoisted(() => vi.fn());
const getMyGroups = vi.hoisted(() => vi.fn());

vi.mock("@/services/dashboard/ownerDashboard.service", () => ({
  OwnerDashboardService: { getOverview },
}));
vi.mock("@/services/group/group.service", () => ({ GroupService: { getMyGroups } }));

describe("useOwnerDashboard", () => {
  beforeEach(() => {
    getOverview.mockReset().mockResolvedValue({ data: { empty: false } });
    getMyGroups.mockReset().mockResolvedValue({
      data: {
        groups: [{ uuid: "g1", name: "Kosher", slug: "kosher", mainCategory: { slug: "food" } }],
      },
    });
  });

  it("loads the overview for the default filters with every traffic source", async () => {
    const { result } = renderHook(() => useOwnerDashboard());
    await waitFor(() => expect(result.current.overviewLoading).toBe(false));
    expect(getOverview).toHaveBeenCalledWith({
      period: "LAST_7_DAYS",
      startDate: undefined,
      endDate: undefined,
      groupUuid: undefined,
      sources: ["INTERNAL_SEARCH", "BROWSE", "DIRECT", "EXTERNAL"],
    });
    expect(result.current.overview).toEqual({ empty: false });
  });

  it("builds group options with edit links", async () => {
    const { result } = renderHook(() => useOwnerDashboard());
    await waitFor(() => expect(result.current.groupOptions).toHaveLength(1));
    expect(result.current.groupOptions[0]).toEqual({
      uuid: "g1",
      name: "Kosher",
      editPath: "/groups/mine/food/kosher",
    });
  });

  it("refetches when the traffic sources change", async () => {
    const { result } = renderHook(() => useOwnerDashboard());
    await waitFor(() => expect(result.current.overviewLoading).toBe(false));

    act(() => result.current.setSources(["direct"]));
    await waitFor(() => expect(getOverview).toHaveBeenCalledTimes(2));
    expect(getOverview).toHaveBeenLastCalledWith(expect.objectContaining({ sources: ["DIRECT"] }));
  });

  it("does not refetch for an incomplete custom range", async () => {
    const { result } = renderHook(() => useOwnerDashboard());
    await waitFor(() => expect(result.current.overviewLoading).toBe(false));

    act(() =>
      result.current.setFilters({ period: "custom", startDate: "2026-10-01", groupUuid: "all" }),
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(result.current.params).toBeNull();
    expect(getOverview).toHaveBeenCalledTimes(1);
  });

  it("flags an error and recovers on retry", async () => {
    getOverview.mockRejectedValueOnce(new Error("down"));
    const { result } = renderHook(() => useOwnerDashboard());
    await waitFor(() => expect(result.current.overviewError).toBe(true));
    expect(result.current.overview).toBeNull();

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.overview).toEqual({ empty: false }));
    expect(result.current.overviewError).toBe(false);
  });

  it("keeps working without groups when the groups request fails", async () => {
    getMyGroups.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useOwnerDashboard());
    await waitFor(() => expect(result.current.overviewLoading).toBe(false));
    expect(result.current.groupOptions).toEqual([]);
  });
});
