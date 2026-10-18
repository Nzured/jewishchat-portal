// @vitest-environment node
import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidateTag } from "next/cache";
import { POST } from "./route";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return { ...actual, timingSafeEqual: vi.fn(actual.timingSafeEqual) };
});

function post(body: unknown, secret?: string) {
  return new NextRequest("http://localhost/api/revalidate", {
    method: "POST",
    headers: secret ? { "x-revalidate-secret": secret } : {},
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.mocked(revalidateTag).mockClear();
    vi.stubEnv("REVALIDATE_SECRET", "s3cret");
  });

  it("returns 503 when no secret is configured", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const res = await POST(post({ tags: ["groups"] }, ""));
    expect(res.status).toBe(503);
  });

  it("compares the secret in constant time", async () => {
    vi.mocked(timingSafeEqual).mockClear();
    await POST(post({ tags: ["groups"] }, "s3cret-but-longer"));
    expect(timingSafeEqual).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, "wrong", "s3cre", "S3CRET"])("rejects secret %j", async (secret) => {
    const res = await POST(post({ tags: ["groups"] }, secret));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates only known tags", async () => {
    const res = await POST(post({ tags: ["groups", "unknown", 5, "seo"] }, "s3cret"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ revalidated: ["groups", "seo"] });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith("groups", "max");
  });

  it.each([
    ["no valid tags", { tags: ["nope"] }],
    ["tags that are not an array", { tags: "groups" }],
    ["an invalid JSON body", "{not json"],
  ])("returns 400 for %s", async (_label, body) => {
    const res = await POST(post(body, "s3cret"));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      allowed: expect.arrayContaining(["groups", "categories", "stats", "users", "seo"]),
    });
  });
});
