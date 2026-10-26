// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { UserType } from "@/types/User";
import { DELETE, POST } from "./route";

function post(body: unknown, contentType = "application/json") {
  return new NextRequest("http://localhost/api/auth/session", {
    method: "POST",
    headers: { "content-type": contentType },
    body: JSON.stringify(body),
  });
}

const valid = { accessToken: "a", refreshToken: "r", userType: UserType.EXTERNAL };

describe("POST /api/auth/session", () => {
  it("stores both tokens as HttpOnly cookies and the user type as a readable cookie", async () => {
    const res = await POST(post(valid));
    expect(res.status).toBe(204);

    const access = res.cookies.get("accessToken");
    const refresh = res.cookies.get("refreshToken");
    const userType = res.cookies.get("userType");
    expect(access).toMatchObject({ value: "a", httpOnly: true, sameSite: "lax", path: "/" });
    expect(refresh).toMatchObject({ value: "r", httpOnly: true });
    expect(userType?.value).toBe(UserType.EXTERNAL);
    expect(userType?.httpOnly).toBeFalsy();
  });

  it("rejects requests that are not JSON, which blocks cross-site form posts", async () => {
    const res = await POST(post(valid, "text/plain"));
    expect(res.status).toBe(415);
    expect(res.cookies.get("accessToken")).toBeUndefined();
  });

  it.each([
    { ...valid, accessToken: "" },
    { ...valid, refreshToken: undefined },
    { ...valid, userType: "ADMIN" },
  ])("rejects an incomplete session %j", async (body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(res.cookies.get("accessToken")).toBeUndefined();
  });
});

describe("DELETE /api/auth/session", () => {
  it("expires every session cookie", () => {
    const res = DELETE();
    expect(res.status).toBe(204);
    ["accessToken", "refreshToken", "userType"].forEach((name) => {
      expect(res.cookies.get(name)).toMatchObject({ value: "", maxAge: 0 });
    });
  });
});
