import { beforeEach, describe, expect, it, vi } from "vitest";
import { writeCookieConsent } from "./cookieConsent";
import { getVisitorFingerprint } from "./visitor";

describe("getVisitorFingerprint", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "cookieConsent=; path=/; max-age=0";
  });

  it("returns nothing without analytics consent", () => {
    expect(getVisitorFingerprint()).toBeUndefined();
    expect(localStorage.getItem("visitorFingerprint")).toBeNull();
  });

  it("returns nothing when analytics was rejected", () => {
    writeCookieConsent(false);
    expect(getVisitorFingerprint()).toBeUndefined();
  });

  it("creates and persists a fingerprint with consent", () => {
    writeCookieConsent(true);
    const first = getVisitorFingerprint();
    expect(first).toEqual(expect.any(String));
    expect(first).not.toHaveLength(0);
    expect(getVisitorFingerprint()).toBe(first);
    expect(localStorage.getItem("visitorFingerprint")).toBe(first);
  });

  it("reuses an existing stored fingerprint", () => {
    writeCookieConsent(true);
    localStorage.setItem("visitorFingerprint", "existing");
    expect(getVisitorFingerprint()).toBe("existing");
  });

  it("returns undefined when storage throws", () => {
    writeCookieConsent(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    expect(getVisitorFingerprint()).toBeUndefined();
  });
});
