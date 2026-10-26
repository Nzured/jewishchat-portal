import { beforeEach, describe, expect, it, vi } from "vitest";
import { REFRESH_API_PATH, SESSION_API_PATH } from "@/configs/const";
import { stubAuthApi } from "@/test/fakeAuthApi";
import { UserType } from "@/types/User";
import {
  clearAuthSession,
  ensureAccessToken,
  getAccessToken,
  getHomePathForUserType,
  hasSession,
  refreshAccessToken,
  setAuthSession,
} from "./auth";

describe("auth session", () => {
  beforeEach(async () => {
    stubAuthApi();
    localStorage.clear();
    await clearAuthSession();
  });

  it("routes users to the right home", () => {
    expect(getHomePathForUserType(UserType.INTERNAL)).toBe("/internal");
    expect(getHomePathForUserType(UserType.EXTERNAL)).toBe("/");
  });

  it("has no token or session before login", async () => {
    expect(getAccessToken()).toBeNull();
    expect(hasSession()).toBe(false);
    await expect(ensureAccessToken()).resolves.toBeNull();
  });

  it("hands the tokens to the session route and keeps only the access token in memory", async () => {
    const api = stubAuthApi();
    await setAuthSession("access-1", "refresh-1", UserType.EXTERNAL);

    const [[, init]] = api.callsTo(SESSION_API_PATH);
    expect(JSON.parse(String(init?.body))).toEqual({
      accessToken: "access-1",
      refreshToken: "refresh-1",
      userType: UserType.EXTERNAL,
    });
    expect(getAccessToken()).toBe("access-1");
    expect(hasSession()).toBe(true);
    expect(localStorage.length).toBe(0);
    expect(document.cookie).not.toContain("access-1");
    expect(document.cookie).not.toContain("refresh-1");
  });

  it("does not keep a token when the session route rejects it", async () => {
    const { fetchMock } = stubAuthApi();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 400 }));

    await expect(setAuthSession("a", "r", UserType.EXTERNAL)).rejects.toThrow();
    expect(getAccessToken()).toBeNull();
  });

  it("restores the access token through the refresh route after a reload", async () => {
    const api = stubAuthApi({ refresh: () => "restored" });
    api.setUserTypeCookie(UserType.EXTERNAL);

    await expect(ensureAccessToken()).resolves.toBe("restored");
    await expect(ensureAccessToken()).resolves.toBe("restored");
    expect(api.callsTo(REFRESH_API_PATH)).toHaveLength(1);
  });

  it("shares one refresh between concurrent callers", async () => {
    let resolve!: (token: string) => void;
    const api = stubAuthApi({ refresh: () => new Promise((r) => (resolve = r)) });
    api.setUserTypeCookie(UserType.EXTERNAL);

    const pending = Promise.all([refreshAccessToken(), refreshAccessToken(), ensureAccessToken()]);
    await vi.waitFor(() => expect(api.callsTo(REFRESH_API_PATH)).toHaveLength(1));
    resolve("new");

    await expect(pending).resolves.toEqual(["new", "new", "new"]);
  });

  it("drops the session when the refresh is rejected", async () => {
    const api = stubAuthApi({ refresh: () => null });
    await setAuthSession("old", "r", UserType.EXTERNAL);

    await expect(refreshAccessToken()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(hasSession()).toBe(false);
    expect(api.callsTo(REFRESH_API_PATH)).toHaveLength(1);
  });

  it("moves a session stored by the old version out of localStorage", async () => {
    const api = stubAuthApi({ refresh: () => "fresh" });
    api.setUserTypeCookie(UserType.INTERNAL);
    localStorage.setItem(
      "auth",
      JSON.stringify({ accessToken: "a", refreshToken: "r", userType: UserType.INTERNAL }),
    );

    await expect(ensureAccessToken()).resolves.toBe("fresh");

    const [[, init]] = api.callsTo(SESSION_API_PATH);
    expect(JSON.parse(String(init?.body))).toMatchObject({ refreshToken: "r" });
    expect(localStorage.getItem("auth")).toBeNull();
  });

  it("ignores a corrupt legacy session", async () => {
    const api = stubAuthApi({ refresh: () => null });
    api.setUserTypeCookie(UserType.EXTERNAL);
    localStorage.setItem("auth", "{broken");

    await expect(ensureAccessToken()).resolves.toBeNull();
    expect(api.callsTo(SESSION_API_PATH)).toHaveLength(0);
    expect(localStorage.getItem("auth")).toBeNull();
  });

  it("clears everything on logout", async () => {
    const api = stubAuthApi();
    await setAuthSession("access-1", "refresh-1", UserType.EXTERNAL);
    await clearAuthSession();

    expect(getAccessToken()).toBeNull();
    expect(hasSession()).toBe(false);
    expect(api.callsTo(SESSION_API_PATH, "DELETE")).toHaveLength(1);
  });
});
