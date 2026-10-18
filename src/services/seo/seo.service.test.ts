import { beforeEach, describe, expect, it, vi } from "vitest";
import { isCategoryIndexable, resolveSeoRedirect } from "./seo.service";

const serverGet = vi.fn();

vi.mock("../serverFetch", () => ({
  serverGet: (...args: unknown[]) => serverGet(...args),
}));

describe("resolveSeoRedirect", () => {
  beforeEach(() => {
    serverGet.mockReset();
  });

  it("returns the canonical path from a bare response", async () => {
    serverGet.mockResolvedValue({ found: true, canonicalPath: "/food/new-slug" });
    await expect(resolveSeoRedirect("/food/old-slug")).resolves.toBe("/food/new-slug");
    expect(serverGet).toHaveBeenCalledWith(
      expect.stringContaining("seo/redirect"),
      expect.objectContaining({ params: { path: "/food/old-slug" } }),
    );
  });

  it("returns the canonical path from a wrapped response", async () => {
    serverGet.mockResolvedValue({ data: { found: true, canonicalPath: "/food/new-slug" } });
    await expect(resolveSeoRedirect("/food/old-slug")).resolves.toBe("/food/new-slug");
  });

  it.each([
    ["not found", { found: false, canonicalPath: "/x" }],
    ["no path", { found: true, canonicalPath: null }],
    ["a wrapped null", { data: null }],
  ])("returns null when %s", async (_label, response) => {
    serverGet.mockResolvedValue(response);
    await expect(resolveSeoRedirect("/a/b")).resolves.toBeNull();
  });

  it("returns null when the request fails", async () => {
    serverGet.mockRejectedValue(new Error("down"));
    await expect(resolveSeoRedirect("/a/b")).resolves.toBeNull();
  });
});

describe("isCategoryIndexable", () => {
  beforeEach(() => {
    serverGet.mockReset();
  });

  it("reads bare and wrapped responses", async () => {
    serverGet.mockResolvedValueOnce({ categorySlug: "food", indexable: true });
    await expect(isCategoryIndexable("food")).resolves.toBe(true);
    serverGet.mockResolvedValueOnce({ data: { categorySlug: "food", indexable: false } });
    await expect(isCategoryIndexable("food")).resolves.toBe(false);
  });

  it("encodes the slug", async () => {
    serverGet.mockResolvedValue({ indexable: true });
    await isCategoryIndexable("a b");
    expect(serverGet.mock.calls[0][0]).toContain("seo/categories/a%20b/indexable");
  });

  it("is not indexable when the request fails", async () => {
    serverGet.mockRejectedValue(new Error("down"));
    await expect(isCategoryIndexable("food")).resolves.toBe(false);
  });
});
