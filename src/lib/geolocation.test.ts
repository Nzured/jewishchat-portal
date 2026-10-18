import { beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: () => Promise.resolve(body) } as Response;
}

async function loadModule() {
  vi.resetModules();
  return import("./geolocation");
}

describe("fetchIpLocation", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps the ipwho.is response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          success: true,
          country: "Israel",
          country_code: "IL",
          region: "Tel Aviv",
          city: "Tel Aviv",
        }),
      ),
    );
    const { fetchIpLocation } = await loadModule();
    await expect(fetchIpLocation()).resolves.toEqual({
      country: "Israel",
      countryCode: "IL",
      region: "Tel Aviv",
      city: "Tel Aviv",
    });
  });

  it("fills missing fields with empty strings", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ success: true })));
    const { fetchIpLocation } = await loadModule();
    await expect(fetchIpLocation()).resolves.toEqual({
      country: "",
      countryCode: "",
      region: "",
      city: "",
    });
  });

  it.each([
    ["an http error", () => Promise.resolve(jsonResponse({}, false))],
    ["an unsuccessful lookup", () => Promise.resolve(jsonResponse({ success: false }))],
    ["a network error", () => Promise.reject(new TypeError("offline"))],
  ])("returns null on %s", async (_label, impl) => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(impl));
    const { fetchIpLocation } = await loadModule();
    await expect(fetchIpLocation()).resolves.toBeNull();
  });
});

describe("fetchIpLocationCached", () => {
  it("only fetches once for concurrent and later callers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, country_code: "IL" }));
    vi.stubGlobal("fetch", fetchMock);
    const { fetchIpLocationCached } = await loadModule();

    const [a, b] = await Promise.all([fetchIpLocationCached(), fetchIpLocationCached()]);
    await fetchIpLocationCached();

    expect(a).toBe(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries after a failed lookup instead of caching the failure forever", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValue(jsonResponse({ success: true, country_code: "US" }));
    vi.stubGlobal("fetch", fetchMock);
    const { fetchIpLocationCached } = await loadModule();

    await expect(fetchIpLocationCached()).resolves.toBeNull();
    await expect(fetchIpLocationCached()).resolves.toMatchObject({ countryCode: "US" });
  });
});
