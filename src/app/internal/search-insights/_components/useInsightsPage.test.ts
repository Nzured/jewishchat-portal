import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PeriodSelection } from "../../_components/PeriodToggle";
import { useInsightsPage } from "./useInsightsPage";

interface Row {
  query: string;
}

function page(queries: Row[], totalQueries = 100) {
  return { data: { queries, totalQueries } } as never;
}

const getKey = (row: Row) => row.query;
const defaultSort = { sortBy: "SEARCHES" as const, sortDir: "DESC" as const };

function setup(selection: PeriodSelection = { period: "7d" }) {
  const fetcher = vi.fn((params: { page?: number }) =>
    Promise.resolve(page([{ query: `q${params.page ?? 0}` }])),
  );
  const hook = renderHook(
    ({ selection: current }) =>
      useInsightsPage<Row, "SEARCHES" | "QUERY">({
        selection: current,
        fetcher,
        getKey,
        defaultSort,
      }),
    { initialProps: { selection } },
  );
  return { fetcher, ...hook };
}

describe("useInsightsPage", () => {
  it("loads the first page with the mapped period", async () => {
    const { fetcher, result } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ period: "LAST_7_DAYS", page: 0, size: 50, sortBy: "SEARCHES" }),
    );
    expect(result.current.rows).toEqual([{ query: "q0" }]);
    expect(result.current.hasMore).toBe(true);
  });

  it("waits for both custom dates before fetching", async () => {
    const { fetcher } = setup({ period: "custom", startDate: "2026-10-01" });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("appends pages for the mobile list on load more", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.mobileRows).toHaveLength(2));
    expect(result.current.mobileRows.map(getKey)).toEqual(["q0", "q1"]);
  });

  it("toggles direction on the same column and uses DESC for a new one", async () => {
    const { result } = setup();
    act(() => result.current.sortByColumn("SEARCHES"));
    expect(result.current.sortDir).toBe("ASC");
    act(() => result.current.sortByColumn("QUERY"));
    expect(result.current).toMatchObject({ sortBy: "QUERY", sortDir: "DESC" });
  });

  it("only requests the first page after the sort changes on a later page", async () => {
    const { fetcher, result } = setup();
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    act(() => result.current.loadMore());
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));

    fetcher.mockClear();
    act(() => result.current.sortByColumn("QUERY"));
    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() => expect(fetcher).toHaveBeenCalled());

    expect(fetcher.mock.calls.map(([params]) => params.page)).toEqual([0]);
  });

  it("resets to the first page when the period changes", async () => {
    const { result, rerender, fetcher } = setup();
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.page).toBe(2));

    fetcher.mockClear();
    rerender({ selection: { period: "30d" } });
    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: "LAST_30_DAYS", page: 0 }),
      ),
    );
  });

  it("clears rows when a request fails", async () => {
    const { fetcher, result } = setup();
    await waitFor(() => expect(result.current.rows).toHaveLength(1));
    fetcher.mockRejectedValueOnce(new Error("down"));
    act(() => result.current.sortByColumn("QUERY"));
    await waitFor(() => expect(result.current.rows).toEqual([]));
    expect(result.current.total).toBe(0);
  });
});
