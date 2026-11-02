import { NextRequest, NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_ENDPOINT, USER_TYPE_COOKIE } from "@/configs/const";
import {
  clearSessionCookies,
  isJsonRequest,
  isUserType,
  setSessionCookies,
} from "@/lib/sessionCookies";
import type { RefreshTokenResponse } from "@/services/auth/auth.types";

function unauthorized() {
  const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  clearSessionCookies(response);
  return response;
}

export async function POST(request: NextRequest) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Expected application/json" }, { status: 415 });
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const userType = request.cookies.get(USER_TYPE_COOKIE)?.value;
  if (!apiBase || !refreshToken) return unauthorized();

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase}/${REFRESH_TOKEN_ENDPOINT.replace(/^\//, "")}`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: refreshToken },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Refresh unavailable" }, { status: 502 });
  }

  if (!upstream.ok) return unauthorized();

  const body = (await upstream.json().catch(() => null)) as RefreshTokenResponse | null;
  const accessToken = body?.data?.accessToken;
  if (!accessToken) return unauthorized();

  const response = NextResponse.json({ accessToken });
  setSessionCookies(response, {
    accessToken,
    refreshToken: body.data.refreshToken || refreshToken,
    userType: isUserType(userType) ? userType : undefined,
  });
  return response;
}
