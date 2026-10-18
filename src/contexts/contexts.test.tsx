import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthSession, setAuthSession } from "@/lib/auth";
import type { FilterItem } from "@/types/Search";
import { User, UserType } from "@/types/User";
import { SearchFilterProvider, useSearchFilter } from "./SearchFilterContext";
import { UserProvider, useUser } from "./UserContext";

const myProfile = vi.fn();

vi.mock("@/services/user/user.service", () => ({
  UserService: { myProfile: () => myProfile() },
}));

describe("SearchFilterContext", () => {
  const initial = [
    { key: "category", value: null, searchValue: "" },
    { key: "city", value: "Haifa", searchValue: "Hai" },
  ] as unknown as FilterItem[];

  function wrapper({ children }: { children: ReactNode }) {
    return <SearchFilterProvider initialFilters={initial}>{children}</SearchFilterProvider>;
  }

  it("throws outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useSearchFilter())).toThrow(/SearchFilterProvider/);
  });

  it("reports active filters from the applied set", () => {
    const { result } = renderHook(() => useSearchFilter(), { wrapper });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("only applies draft changes on applyFilters", () => {
    const { result } = renderHook(() => useSearchFilter(), { wrapper });

    act(() => result.current.updateFilterValue("category", "food"));
    expect(result.current.filters[0].value).toBe("food");
    expect(result.current.appliedFilters[0].value).toBeNull();

    act(() => result.current.applyFilters());
    expect(result.current.appliedFilters[0].value).toBe("food");
  });

  it("applies a single value immediately to both sets", () => {
    const { result } = renderHook(() => useSearchFilter(), { wrapper });
    act(() => result.current.applyFilterValue("category", "food"));
    expect(result.current.filters[0].value).toBe("food");
    expect(result.current.appliedFilters[0].value).toBe("food");
  });

  it("clears one filter and its search text", () => {
    const { result } = renderHook(() => useSearchFilter(), { wrapper });
    act(() => result.current.clearFilter("city"));
    expect(result.current.appliedFilters[1]).toMatchObject({ value: null, searchValue: "" });
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("treats an array of empty values as inactive", () => {
    const { result } = renderHook(() => useSearchFilter(), { wrapper });
    act(() => result.current.clearAllFilters());
    act(() => result.current.applyFilterValue("category", ["", ""]));
    expect(result.current.hasActiveFilters).toBe(false);
    act(() => result.current.applyFilterValue("category", ["", "food"]));
    expect(result.current.hasActiveFilters).toBe(true);
  });
});

describe("UserContext", () => {
  const baseUser = {
    uuid: "u-1",
    firstName: "Dana",
    lastName: "Levi",
    email: "dana@example.com",
    superAdmin: false,
    permissions: ["can_view_groups"],
    userType: UserType.INTERNAL,
  } as unknown as User;

  function wrapper({ children }: { children: ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
  }

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearAuthSession();
    myProfile.mockReset();
  });

  it("finishes loading without a user when logged out", async () => {
    const { result } = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(myProfile).not.toHaveBeenCalled();
  });

  it("loads the profile when logged in and caches it per token", async () => {
    setAuthSession("token-1", "r", UserType.INTERNAL);
    myProfile.mockResolvedValue({ data: baseUser });

    const first = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(first.result.current.user).toEqual(baseUser));
    first.unmount();

    const second = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(second.result.current.user).toEqual(baseUser));
    expect(myProfile).toHaveBeenCalledTimes(1);
  });

  it("does not reuse a cached profile for a different token", async () => {
    setAuthSession("token-1", "r", UserType.INTERNAL);
    myProfile.mockResolvedValue({ data: baseUser });
    const first = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(first.result.current.user).not.toBeNull());
    first.unmount();

    setAuthSession("token-2", "r", UserType.INTERNAL);
    const second = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(second.result.current.isLoading).toBe(false));
    expect(myProfile).toHaveBeenCalledTimes(2);
  });

  it("checks permissions, with super admins allowed everything", async () => {
    setAuthSession("token-1", "r", UserType.INTERNAL);
    myProfile.mockResolvedValue({ data: baseUser });
    const { result } = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    expect(result.current.hasPermission("can_view_groups")).toBe(true);
    expect(result.current.hasPermission("can_delete_groups")).toBe(false);
  });

  it("does not crash when the profile has no permissions list", async () => {
    setAuthSession("token-1", "r", UserType.EXTERNAL);
    myProfile.mockResolvedValue({ data: { ...baseUser, permissions: null } });
    const { result } = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    expect(() => result.current.hasPermission("can_view_groups")).not.toThrow();
    expect(result.current.hasPermission("can_view_groups")).toBe(false);
  });

  it("clears the user when the profile request fails", async () => {
    setAuthSession("token-1", "r", UserType.INTERNAL);
    myProfile.mockRejectedValue(new Error("401"));
    const { result } = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("clearUser drops the user and the cache", async () => {
    setAuthSession("token-1", "r", UserType.INTERNAL);
    myProfile.mockResolvedValue({ data: baseUser });
    const { result } = renderHook(() => useUser(), { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    act(() => result.current.clearUser());
    expect(result.current.user).toBeNull();
    expect(sessionStorage.getItem("profile")).toBeNull();
  });
});
