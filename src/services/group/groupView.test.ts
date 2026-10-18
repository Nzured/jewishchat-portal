import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GROUP_VIEW_DEDUPE_MS } from "@/configs/const";

const recordGroupViewApi = vi.fn();

vi.mock("./group.service", () => ({
  GroupService: { recordGroupView: (...args: unknown[]) => recordGroupViewApi(...args) },
}));

async function loadModule() {
  vi.resetModules();
  const consent = await import("@/lib/cookieConsent");
  const searchClick = await import("@/services/search/searchClick");
  const groupView = await import("./groupView");
  return { ...consent, ...searchClick, ...groupView };
}

describe("recordGroupView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T12:00:00Z"));
    sessionStorage.clear();
    localStorage.clear();
    document.cookie = "cookieConsent=; path=/; max-age=0";
    recordGroupViewApi.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing without analytics consent", async () => {
    const { recordGroupView } = await loadModule();
    recordGroupView("g-1");
    expect(recordGroupViewApi).not.toHaveBeenCalled();
  });

  it("records a view with the visitor fingerprint", async () => {
    const { recordGroupView, writeCookieConsent } = await loadModule();
    writeCookieConsent(true);

    recordGroupView("g-1");

    expect(recordGroupViewApi).toHaveBeenCalledWith(
      "g-1",
      expect.objectContaining({ fingerprint: expect.any(String) }),
    );
  });

  it("dedupes repeat views of the same group within the window", async () => {
    const { recordGroupView, writeCookieConsent } = await loadModule();
    writeCookieConsent(true);

    recordGroupView("g-1");
    vi.advanceTimersByTime(GROUP_VIEW_DEDUPE_MS - 1);
    recordGroupView("g-1");
    expect(recordGroupViewApi).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    recordGroupView("g-1");
    expect(recordGroupViewApi).toHaveBeenCalledTimes(2);
  });

  it("counts different groups separately", async () => {
    const { recordGroupView, writeCookieConsent } = await loadModule();
    writeCookieConsent(true);

    recordGroupView("g-1");
    recordGroupView("g-2");
    expect(recordGroupViewApi).toHaveBeenCalledTimes(2);
  });

  it("dedupes across page loads using session storage", async () => {
    const first = await loadModule();
    first.writeCookieConsent(true);
    first.recordGroupView("g-1");

    const second = await loadModule();
    second.recordGroupView("g-1");
    expect(recordGroupViewApi).toHaveBeenCalledTimes(1);
  });

  it("attaches the search query that led to the view, only once", async () => {
    const { recordGroupView, trackSearchClick, writeCookieConsent } = await loadModule();
    writeCookieConsent(true);
    vi.stubGlobal("navigator", { ...navigator, sendBeacon: vi.fn().mockReturnValue(true) });

    trackSearchClick({ groupUuid: "g-1", query: "  kosher  ", position: 1 });
    recordGroupView("g-1");

    expect(recordGroupViewApi).toHaveBeenLastCalledWith(
      "g-1",
      expect.objectContaining({ searchQuery: "kosher" }),
    );
    expect(sessionStorage.getItem("searchAttribution")).toBeNull();
  });

  it("swallows API failures", async () => {
    const { recordGroupView, writeCookieConsent } = await loadModule();
    writeCookieConsent(true);
    recordGroupViewApi.mockRejectedValue(new Error("boom"));
    expect(() => recordGroupView("g-1")).not.toThrow();
  });
});
