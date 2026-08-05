import { NextResponse, NextRequest } from "next/server";
import { getHomePathForUserType } from "@/lib/auth";
import { UserType } from "@/types/User";
import { ACCESS_TOKEN_COOKIE, EXTERNAL_HOME_PATH, USER_TYPE_COOKIE } from "./configs/const";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/accept-invite"];

// Renders regardless of session state. Accepting an invite activates a
// specific account tied to the token in the URL — unrelated to whichever
// session (if any) already happens to be active in this browser, so it
// shouldn't get bounced to that session's dashboard.
const ALWAYS_ACCESSIBLE_PATHS = ["/accept-invite"];

// The public-facing group directory — browsable without an account.
// Auth-gated actions within it (e.g. adding a group) check auth client-side.
const PUBLIC_PATHS = ["/external"];

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matchesPath(pathname, ALWAYS_ACCESSIBLE_PATHS)) return NextResponse.next();

  // Neither "/" nor "/external" renders anything of its own — both are just
  // entry points into the public directory.
  if (pathname === "/external") {
    return NextResponse.redirect(new URL(EXTERNAL_HOME_PATH, request.url));
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const userType = request.cookies.get(USER_TYPE_COOKIE)?.value as UserType | undefined;
  const isAuthenticated = Boolean(
    accessToken && userType && Object.values(UserType).includes(userType),
  );

  const isAuthPath = matchesPath(pathname, AUTH_PATHS);
  const isPublicPath = matchesPath(pathname, PUBLIC_PATHS);

  if (!isAuthenticated) {
    if (isAuthPath || isPublicPath) return NextResponse.next();

    // Landing on the site root without a session shows the public directory,
    // not a login wall.
    if (pathname === "/") {
      return NextResponse.redirect(new URL(EXTERNAL_HOME_PATH, request.url));
    }

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
