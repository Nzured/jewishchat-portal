import { NextResponse, NextRequest } from "next/server";
import { getHomePathForUserType } from "@/lib/auth";
import { UserType } from "@/types/User";
import { ACCESS_TOKEN_COOKIE, USER_TYPE_COOKIE } from "./configs/const";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const userType = request.cookies.get(USER_TYPE_COOKIE)?.value as UserType | undefined;
  const isAuthenticated = Boolean(
    accessToken && userType && Object.values(UserType).includes(userType),
  );

  const isAuthPath = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isAuthenticated) {
    if (isAuthPath) return NextResponse.next();

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const homePath = getHomePathForUserType(userType as UserType);

  if (isAuthPath || pathname === "/") {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (pathname.startsWith("/internal") && userType !== UserType.INTERNAL) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (pathname.startsWith("/external") && userType !== UserType.EXTERNAL) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
