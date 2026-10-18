import { beforeEach, describe, expect, it, vi } from "vitest";

function readBlob(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });
}

async function loadBeacon(apiUrl?: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", apiUrl ?? "");
  return (await import("./beacon")).postBeacon;
}

describe("postBeacon", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(new Response(null));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("uses sendBeacon with a JSON blob when available", async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { ...navigator, sendBeacon });
    const postBeacon = await loadBeacon("https://api.example.com/");

    postBeacon("/search/click", { a: 1 });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, blob] = sendBeacon.mock.calls[0] as [string, Blob];
    expect(url).toBe("https://api.example.com/search/click");
    expect(blob.type).toBe("application/json");
    await expect(readBlob(blob)).resolves.toBe('{"a":1}');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to a keepalive fetch when sendBeacon refuses the payload", async () => {
    vi.stubGlobal("navigator", { ...navigator, sendBeacon: vi.fn().mockReturnValue(false) });
    const postBeacon = await loadBeacon("https://api.example.com");

    postBeacon("/x", { a: 1 });

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"a":1}',
      keepalive: true,
    });
  });

  it("falls back to fetch when sendBeacon is missing, using /api without a base url", async () => {
    vi.stubGlobal("navigator", { ...navigator, sendBeacon: undefined });
    const postBeacon = await loadBeacon();

    postBeacon("/x", {});

    expect(fetchMock).toHaveBeenCalledWith("/api/x", expect.objectContaining({ method: "POST" }));
  });

  it("swallows fetch rejections", async () => {
    vi.stubGlobal("navigator", { ...navigator, sendBeacon: undefined });
    fetchMock.mockRejectedValue(new TypeError("offline"));
    const postBeacon = await loadBeacon("https://api.example.com");
    expect(() => postBeacon("/x", {})).not.toThrow();
  });
});
