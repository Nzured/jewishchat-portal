import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookies,
  isJsonRequest,
  isUserType,
  setSessionCookies,
} from "@/lib/sessionCookies";

interface SessionBody {
  accessToken?: unknown;
  refreshToken?: unknown;
  userType?: unknown;
}

const isToken = (value: unknown): value is string => typeof value === "string" && value !== "";

export async function POST(request: NextRequest) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ error: "Expected application/json" }, { status: 415 });
  }

  const body = (await request.json().catch(() => ({}))) as SessionBody;
  const { accessToken, refreshToken, userType } = body;
  if (!isToken(accessToken) || !isToken(refreshToken) || !isUserType(userType)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const response = new NextResponse(null, { status: 204 });
  setSessionCookies(response, { accessToken, refreshToken, userType });
  return response;
}

export function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  clearSessionCookies(response);
  return response;
}
