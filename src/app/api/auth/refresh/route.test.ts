// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserType } from "@/types/User";
import { POST } from "./route";

const fetchMock = vi.fn();

function request(cookies: Record<string, string> = {}, contentType = "application/json") {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  return new NextRequest("http://localhost/api/auth/refresh", {
    method: "POST",
    headers: { "content-type": contentType, ...(cookie ? { cookie } : {}) },
  });
}

const session = { refreshToken: "r-1", userType: UserType.INTERNAL };

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.test");
  });

  it("refreshes with the HttpOnly cookie and rotates the cookies", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ data: { accessToken: "a-2", refreshToken: "r-2" } }),
    );

    const res = await POST(request(session));

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/auth-service/api/v1/auth/refresh-token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "r-1" }),
      }),
    );
    await expect(res.json()).resolves.toEqual({ accessToken: "a-2" });
    expect(res.cookies.get("accessToken")).toMatchObject({ value: "a-2", httpOnly: true });
    expect(res.cookies.get("refreshToken")).toMatchObject({ value: "r-2", httpOnly: true });
    expect(res.cookies.get("userType")?.value).toBe(UserType.INTERNAL);
  });

  it("never returns the refresh token to the browser", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ data: { accessToken: "a-2", refreshToken: "r-2" } }),
    );
    const res = await POST(request(session));
    expect(JSON.stringify(await res.json())).not.toContain("r-2");
  });

  it("keeps the current refresh token when the API does not rotate it", async () => {
    fetchMock.mockResolvedValue(Response.json({ data: { accessToken: "a-2" } }));
    const res = await POST(request(session));
    expect(res.cookies.get("refreshToken")?.value).toBe("r-1");
  });

  it("clears the session when there is no refresh cookie", async () => {
    const res = await POST(request());
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(res.cookies.get("refreshToken")).toMatchObject({ value: "", maxAge: 0 });
  });

  it("clears the session when the API rejects the refresh token", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const res = await POST(request(session));
    expect(res.status).toBe(401);
    expect(res.cookies.get("accessToken")).toMatchObject({ value: "", maxAge: 0 });
  });

  it("keeps the session when the API cannot be reached", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    const res = await POST(request(session));
    expect(res.status).toBe(502);
    expect(res.cookies.get("refreshToken")).toBeUndefined();
  });

  it("rejects requests that are not JSON", async () => {
    const res = await POST(request(session, "text/plain"));
    expect(res.status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
