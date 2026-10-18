import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESS_TOKEN_COOKIE, COOKIE_MAX_AGE, USER_TYPE_COOKIE } from "@/configs/const";
import { UserType } from "@/types/User";
import {
  clearAuthSession,
  getAccessToken,
  getHomePathForUserType,
  getRefreshToken,
  setAuthSession,
  updateAccessToken,
} from "./auth";

function cookieValue(name: string) {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function captureCookieWrites() {
  const writes: string[] = [];
  const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie")!;
  vi.spyOn(document, "cookie", "set").mockImplementation((value: string) => {
    writes.push(value);
    descriptor.set!.call(document, value);
  });
  return writes;
}

describe("auth session", () => {
  beforeEach(() => {
    localStorage.clear();
    clearAuthSession();
  });
  afterEach(() => {
    clearAuthSession();
  });

  it("routes users to the right home", () => {
    expect(getHomePathForUserType(UserType.INTERNAL)).toBe("/internal");
    expect(getHomePathForUserType(UserType.EXTERNAL)).toBe("/");
  });

  it("has no tokens before login", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("stores tokens and cookies on login", () => {
    setAuthSession("access-1", "refresh-1", UserType.EXTERNAL);
    expect(getAccessToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("refresh-1");
    expect(cookieValue(ACCESS_TOKEN_COOKIE)).toBe("access-1");
    expect(cookieValue(USER_TYPE_COOKIE)).toBe(UserType.EXTERNAL);
  });

  it("rotates tokens on refresh and keeps the user type", () => {
    setAuthSession("access-1", "refresh-1", UserType.INTERNAL);
    updateAccessToken("access-2", "refresh-2");
    expect(getAccessToken()).toBe("access-2");
    expect(getRefreshToken()).toBe("refresh-2");
    expect(JSON.parse(localStorage.getItem("auth")!)).toMatchObject({
      userType: UserType.INTERNAL,
    });
    expect(cookieValue(ACCESS_TOKEN_COOKIE)).toBe("access-2");
  });

  it("extends the user type cookie together with the access token cookie on refresh", () => {
    setAuthSession("access-1", "refresh-1", UserType.EXTERNAL);
    const writes = captureCookieWrites();

    updateAccessToken("access-2", "refresh-2");

    const accessWrite = writes.find((w) => w.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
    const userTypeWrite = writes.find((w) => w.startsWith(`${USER_TYPE_COOKIE}=`));
    expect(accessWrite).toContain(`max-age=${COOKIE_MAX_AGE}`);
    expect(userTypeWrite).toBeDefined();
    expect(userTypeWrite).toContain(`${USER_TYPE_COOKIE}=${UserType.EXTERNAL};`);
    expect(userTypeWrite).toContain(`max-age=${COOKIE_MAX_AGE}`);
  });

  it("clears everything on logout", () => {
    setAuthSession("access-1", "refresh-1", UserType.EXTERNAL);
    clearAuthSession();
    expect(getAccessToken()).toBeNull();
    expect(cookieValue(ACCESS_TOKEN_COOKIE)).toBeUndefined();
    expect(cookieValue(USER_TYPE_COOKIE)).toBeUndefined();
  });

  it("treats corrupt stored auth as logged out", () => {
    localStorage.setItem("auth", "{broken");
    expect(getAccessToken()).toBeNull();
  });
});
