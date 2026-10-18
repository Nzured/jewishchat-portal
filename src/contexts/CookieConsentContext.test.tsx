import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { readCookieConsent } from "@/lib/cookieConsent";
import { CookieConsentProvider, useCookieConsent } from "./CookieConsentContext";

function wrapper({ children }: { children: ReactNode }) {
  return <CookieConsentProvider>{children}</CookieConsentProvider>;
}

describe("CookieConsentContext", () => {
  beforeEach(() => {
    document.cookie = "cookieConsent=; path=/; max-age=0";
    localStorage.clear();
  });

  it("is ready with no consent before the visitor chooses", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    expect(result.current).toMatchObject({ isReady: true, consent: null, isSettingsOpen: false });
  });

  it("accepts all and updates the consent", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    act(() => result.current.acceptAll());
    expect(result.current.consent?.analytics).toBe(true);
    expect(readCookieConsent()?.analytics).toBe(true);
  });

  it("rejects all", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    act(() => result.current.rejectAll());
    expect(result.current.consent?.analytics).toBe(false);
  });

  it("closes the settings after saving preferences", () => {
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    act(() => result.current.openSettings());
    expect(result.current.isSettingsOpen).toBe(true);
    act(() => result.current.savePreferences(true));
    expect(result.current.isSettingsOpen).toBe(false);
  });

  it("picks up consent stored before mount", () => {
    document.cookie = `cookieConsent=${encodeURIComponent(
      JSON.stringify({ necessary: true, analytics: true, updatedAt: "2026-01-01T00:00:00Z" }),
    )}; path=/`;
    const { result } = renderHook(() => useCookieConsent(), { wrapper });
    expect(result.current.consent).toMatchObject({ analytics: true, updatedAt: "2026-01-01T00:00:00Z" });
  });
});
