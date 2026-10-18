import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

async function loadModule() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/");
  vi.stubGlobal("fetch", fetchMock);
  return import("./serverFetch");
}

describe("serverGet", () => {
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
  });

  it("joins the base url and path and parses JSON", async () => {
    const { serverGet } = await loadModule();
    await expect(serverGet("/group-service/api/v1/groups")).resolves.toEqual({ ok: true });
    const [url] = fetchMock.mock.calls[0] as [URL];
    expect(url.toString()).toBe("https://api.example.com/group-service/api/v1/groups");
  });

  it("skips empty params and stringifies the rest", async () => {
    const { serverGet } = await loadModule();
    await serverGet("/x", {
      params: { a: "1", b: undefined, c: null, d: "", e: 0, f: false },
    });
    const [url] = fetchMock.mock.calls[0] as [URL];
    expect(url.search).toBe("?a=1&e=0&f=false");
  });

  it("disables caching when revalidate is 0", async () => {
    const { serverGet } = await loadModule();
    await serverGet("/x", { revalidate: 0, tags: ["groups"] });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
    expect(fetchMock.mock.calls[0][1]).not.toHaveProperty("next");
  });

  it("passes revalidate and tags to Next otherwise", async () => {
    const { serverGet } = await loadModule();
    await serverGet("/x", { revalidate: 300, tags: ["groups"] });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      next: { revalidate: 300, tags: ["groups"] },
    });
  });

  it("throws a ServerApiError with the status on failure", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 404 }));
    const { serverGet, ServerApiError } = await loadModule();
    const error = await serverGet("/missing").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServerApiError);
    expect(error).toMatchObject({ status: 404, url: "/missing" });
  });
});
