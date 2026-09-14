import { NextResponse, NextRequest } from "next/server";
import { getHomePathForUserType } from "@/lib/auth";
import { UserType } from "@/types/User";
import {
  ACCESS_TOKEN_COOKIE,
  GROUP_SERVICE,
  RESERVED_ROUTE_SLUGS,
  USER_TYPE_COOKIE,
} from "./configs/const";

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/accept-invite"];

const ALWAYS_ACCESSIBLE_PATHS = ["/accept-invite"];

const INTERNAL_PATH = "/internal";

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const STATIC_TOP_LEVEL_SEGMENTS = new Set([
  "groups",
  "internal",
  "home",
  "categories",
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "accept-invite",
]);

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const GONE_CHECK_TIMEOUT_MS = 1500;
const GONE_CACHE_TTL_MS = 5 * 60 * 1000;
const GONE_CACHE_MAX_ENTRIES = 5000;

const goneCache = new Map<string, { gone: boolean; expiresAt: number }>();

function readGoneCache(key: string): boolean | null {
  const entry = goneCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    goneCache.delete(key);
    return null;
  }
  return entry.gone;
}

function writeGoneCache(key: string, gone: boolean) {
  if (goneCache.size >= GONE_CACHE_MAX_ENTRIES) {
    const oldest = goneCache.keys().next().value;
    if (oldest !== undefined) goneCache.delete(oldest);
  }
  goneCache.set(key, {
    gone,
    expiresAt: gone ? Number.POSITIVE_INFINITY : Date.now() + GONE_CACHE_TTL_MS,
  });
}

const GONE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Group no longer available | ChatList</title>
<meta name="robots" content="noindex" />
<style>
  body { font: 16px/1.5 system-ui, sans-serif; color: #1a1a1a; background: #fafafa;
    display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
  main { max-width: 32rem; text-align: center; }
  h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
  a { color: #16794c; }
</style>
</head>
<body>
<main>
  <h1>This group has been removed</h1>
  <p>The listing you're looking for was permanently taken down and is no longer available.</p>
  <p><a href="/groups">Browse other groups</a></p>
</main>
</body>
</html>`;

async function checkGroupGone(category: string, groupSlug: string): Promise<boolean> {
  if (!API_BASE) return false;

  const key = `${category}/${groupSlug}`;
  const cached = readGoneCache(key);
  if (cached !== null) return cached;

  try {
    const res = await fetch(
      `${API_BASE}${GROUP_SERVICE}groups/${encodeURIComponent(category)}/${encodeURIComponent(groupSlug)}`,
      { signal: AbortSignal.timeout(GONE_CHECK_TIMEOUT_MS) },
    );
    const gone = res.status === 410;
    if (res.ok || gone || res.status === 404) writeGoneCache(key, gone);
    return gone;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (matchesPath(pathname, ALWAYS_ACCESSIBLE_PATHS)) return NextResponse.next();

  if (pathname === "/home") {
    return NextResponse.redirect(new URL("/", request.url), 308);
  }

  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length === 2 &&
    !STATIC_TOP_LEVEL_SEGMENTS.has(segments[0]) &&
    !RESERVED_ROUTE_SLUGS.includes(segments[0])
  ) {
    const [category, groupSlug] = segments;
    if (await checkGroupGone(category, groupSlug)) {
      return new NextResponse(GONE_HTML, {
        status: 410,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const userType = request.cookies.get(USER_TYPE_COOKIE)?.value as UserType | undefined;
  const isAuthenticated = Boolean(
    accessToken && userType && Object.values(UserType).includes(userType),
  );

  const isAuthPath = matchesPath(pathname, AUTH_PATHS);
  const isInternalPath = matchesPath(pathname, [INTERNAL_PATH]);
  const isPublicPath = !isAuthPath && !isInternalPath;

  if (!isAuthenticated) {
    if (isAuthPath || isPublicPath) return NextResponse.next();

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const homePath = getHomePathForUserType(userType as UserType);

  if (isAuthPath) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (isInternalPath && userType !== UserType.INTERNAL) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (isPublicPath && userType !== UserType.EXTERNAL) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
