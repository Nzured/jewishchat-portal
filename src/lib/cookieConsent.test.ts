import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_CONSENT_COOKIE } from "@/configs/const";
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  hasAnalyticsConsent,
  readCookieConsent,
  subscribeCookieConsent,
  writeCookieConsent,
} from "./cookieConsent";

function setRawCookie(value: string) {
  document.cookie = `${COOKIE_CONSENT_COOKIE}=${value}; path=/`;
}

function clearCookies() {
  document.cookie.split("; ").forEach((entry) => {
    const name = entry.split("=")[0];
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  });
}

describe("cookie consent", () => {
  beforeEach(() => {
    clearCookies();
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    clearCookies();
  });

  it("returns null when no consent cookie exists", () => {
    expect(readCookieConsent()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("round-trips a written consent", () => {
    const written = writeCookieConsent(true);
    expect(written.necessary).toBe(true);
    expect(readCookieConsent()).toEqual(written);
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("treats rejected analytics as no analytics consent", () => {
    writeCookieConsent(false);
    expect(readCookieConsent()?.analytics).toBe(false);
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("clears analytics storage when analytics is rejected", () => {
    localStorage.setItem("visitorFingerprint", "fp");
    sessionStorage.setItem("groupViews", "{}");
    sessionStorage.setItem("searchAttribution", "{}");
    localStorage.setItem("unrelated", "keep");

    writeCookieConsent(false);

    expect(localStorage.getItem("visitorFingerprint")).toBeNull();
    expect(sessionStorage.getItem("groupViews")).toBeNull();
    expect(sessionStorage.getItem("searchAttribution")).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep");
  });

  it("keeps analytics storage when analytics is accepted", () => {
    localStorage.setItem("visitorFingerprint", "fp");
    writeCookieConsent(true);
    expect(localStorage.getItem("visitorFingerprint")).toBe("fp");
  });

  it("notifies subscribers when consent changes and stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCookieConsent(listener);

    writeCookieConsent(true);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    writeCookieConsent(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("dispatches the consent as event detail", () => {
    const handler = vi.fn();
    window.addEventListener(COOKIE_CONSENT_EVENT, handler);
    const consent = writeCookieConsent(true);
    window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual(consent);
  });

  it.each([
    ["not json", "garbage"],
    ["missing analytics", encodeURIComponent(JSON.stringify({ necessary: true }))],
    ["non-boolean analytics", encodeURIComponent(JSON.stringify({ analytics: "yes" }))],
    ["json null", "null"],
  ])("ignores a cookie with %s", (_label, raw) => {
    setRawCookie(raw);
    expect(readCookieConsent()).toBeNull();
  });

  it("does not throw on a cookie value that is not valid URI encoding", () => {
    setRawCookie("%E0%A4%A");
    expect(() => readCookieConsent()).not.toThrow();
    expect(readCookieConsent()).toBeNull();
    expect(() => getCookieConsentSnapshot()).not.toThrow();
  });

  it("does not match a cookie whose name only starts with the consent cookie name", () => {
    document.cookie = `${COOKIE_CONSENT_COOKIE}Old=${encodeURIComponent(
      JSON.stringify({ analytics: true }),
    )}; path=/`;
    expect(readCookieConsent()).toBeNull();
  });

  it("returns a stable snapshot object while the cookie is unchanged", () => {
    writeCookieConsent(true);
    const first = getCookieConsentSnapshot();
    expect(getCookieConsentSnapshot()).toBe(first);

    writeCookieConsent(false);
    const second = getCookieConsentSnapshot();
    expect(second).not.toBe(first);
    expect(second?.analytics).toBe(false);
  });

  it("has an undefined server snapshot so the client can tell it is not hydrated yet", () => {
    expect(getCookieConsentServerSnapshot()).toBeUndefined();
  });
});
