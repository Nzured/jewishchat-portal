import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SEARCH_ATTRIBUTION_TTL_MS } from "@/configs/const";
import { writeCookieConsent } from "@/lib/cookieConsent";
import { takeSearchAttribution, trackSearchClick } from "./searchClick";

const sendBeacon = vi.fn();

function readBlob(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });
}

describe("search click tracking", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T12:00:00Z"));
    sessionStorage.clear();
    localStorage.clear();
    document.cookie = "cookieConsent=; path=/; max-age=0";
    sendBeacon.mockReset().mockReturnValue(true);
    vi.stubGlobal("navigator", { ...navigator, sendBeacon });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not track without analytics consent", () => {
    trackSearchClick({ groupUuid: "g-1", query: "kosher", position: 0 });
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(takeSearchAttribution("g-1")).toBeUndefined();
  });

  it("ignores blank queries", () => {
    writeCookieConsent(true);
    trackSearchClick({ groupUuid: "g-1", query: "   ", position: 0 });
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("sends a beacon with the trimmed query", async () => {
    writeCookieConsent(true);
    trackSearchClick({ searchId: "s-1", groupUuid: "g-1", query: " kosher ", position: 2 });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
    const body = JSON.parse(await readBlob(sendBeacon.mock.calls[0][1] as Blob));
    expect(body).toMatchObject({ searchId: "s-1", groupUuid: "g-1", query: "kosher", position: 2 });
    expect(body.visitorId).toEqual(expect.any(String));
  });

  it("attributes the next view of the clicked group, once", () => {
    writeCookieConsent(true);
    trackSearchClick({ groupUuid: "g-1", query: "kosher", position: 0 });
    expect(takeSearchAttribution("g-1")).toBe("kosher");
    expect(takeSearchAttribution("g-1")).toBeUndefined();
  });

  it("does not attribute a different group", () => {
    writeCookieConsent(true);
    trackSearchClick({ groupUuid: "g-1", query: "kosher", position: 0 });
    expect(takeSearchAttribution("g-2")).toBeUndefined();
  });

  it("expires the attribution after the TTL", () => {
    writeCookieConsent(true);
    trackSearchClick({ groupUuid: "g-1", query: "kosher", position: 0 });
    vi.advanceTimersByTime(SEARCH_ATTRIBUTION_TTL_MS + 1);
    expect(takeSearchAttribution("g-1")).toBeUndefined();
  });
});
