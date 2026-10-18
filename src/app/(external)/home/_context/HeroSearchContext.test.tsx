import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSearchProvider, useHeroSearch } from "./HeroSearchContext";

const searchGroups = vi.hoisted(() => vi.fn());

vi.mock("@/services/search/search.service", () => ({
  SearchService: { searchGroups },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <HeroSearchProvider>{children}</HeroSearchProvider>;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function results(term: string) {
  return {
    data: { results: [{ uuid: term }], totalResults: 7, searchId: `s-${term}` },
  };
}

describe("HeroSearchContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    searchGroups.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null outside the provider", () => {
    const { result } = renderHook(() => useHeroSearch());
    expect(result.current).toBeNull();
  });

  it("debounces before searching and asks for a 3-result preview", async () => {
    searchGroups.mockResolvedValue(results("kosher"));
    const { result } = renderHook(() => useHeroSearch()!, { wrapper });

    act(() => result.current.setQuery("kosher"));
    expect(searchGroups).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(300));

    expect(searchGroups).toHaveBeenCalledWith("kosher", "", "", "", 0, 3);
    expect(result.current).toMatchObject({
      query: "kosher",
      totalResults: 7,
      searchId: "s-kosher",
      isSearching: false,
    });
  });

  it("does not search below the minimum length", async () => {
    const { result } = renderHook(() => useHeroSearch()!, { wrapper });
    act(() => result.current.setQuery("abc"));
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(searchGroups).not.toHaveBeenCalled();
    expect(result.current.isSearching).toBe(false);
  });

  it("trims whitespace before searching", async () => {
    searchGroups.mockResolvedValue(results("torah"));
    const { result } = renderHook(() => useHeroSearch()!, { wrapper });
    act(() => result.current.setQuery("  torah  "));
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(searchGroups.mock.calls[0][0]).toBe("torah");
  });

  it("ignores a slow response for an older query", async () => {
    const slow = deferred<unknown>();
    searchGroups.mockReturnValueOnce(slow.promise).mockResolvedValue(results("kosher food"));
    const { result } = renderHook(() => useHeroSearch()!, { wrapper });

    act(() => result.current.setQuery("kosher"));
    await act(() => vi.advanceTimersByTimeAsync(300));
    act(() => result.current.setQuery("kosher food"));
    await act(() => vi.advanceTimersByTimeAsync(300));
    await act(async () => slow.resolve(results("kosher")));

    expect(result.current.searchId).toBe("s-kosher food");
  });

  it("shows no results and stops searching when the request fails", async () => {
    searchGroups.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useHeroSearch()!, { wrapper });
    act(() => result.current.setQuery("kosher"));
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(result.current).toMatchObject({ results: [], totalResults: 0, isSearching: false });
  });
});
