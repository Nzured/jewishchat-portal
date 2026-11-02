import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  USER_TYPE_COOKIE,
} from "@/configs/const";
import { UserType } from "@/types/User";

export interface SessionCookieValues {
  accessToken: string;
  refreshToken: string;
  userType?: UserType;
}

const cookieOptions = () => ({
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
});

export function isUserType(value: unknown): value is UserType {
  return Object.values(UserType).includes(value as UserType);
}

export function isJsonRequest(request: NextRequest) {
  return (request.headers.get("content-type") ?? "").includes("application/json");
}

export function setSessionCookies(
  response: NextResponse,
  { accessToken, refreshToken, userType }: SessionCookieValues,
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { ...cookieOptions(), httpOnly: true });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...cookieOptions(), httpOnly: true });
  if (userType) response.cookies.set(USER_TYPE_COOKIE, userType, cookieOptions());
}

export function clearSessionCookies(response: NextResponse) {
  [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_TYPE_COOKIE].forEach((name) =>
    response.cookies.set(name, "", { ...cookieOptions(), maxAge: 0 }),
  );
}
