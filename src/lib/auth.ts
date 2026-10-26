import {
  EXTERNAL_HOME_PATH,
  REFRESH_API_PATH,
  SESSION_API_PATH,
  USER_TYPE_COOKIE,
} from "@/configs/const";
import { UserType } from "@/types/User";

const LEGACY_AUTH_STORAGE_KEY = "auth";

interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  userType: UserType;
}

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getHomePathForUserType(userType: UserType) {
  return userType === UserType.INTERNAL ? "/internal" : EXTERNAL_HOME_PATH;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function hasSession(): boolean {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${USER_TYPE_COOKIE}=`) && entry !== `${USER_TYPE_COOKIE}=`);
}

async function storeSession(payload: SessionPayload) {
  const res = await fetch(SESSION_API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to store session");
}

function takeLegacySession(): SessionPayload | null {
  try {
    const raw = localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionPayload) : null;
  } catch {
    return null;
  }
}

async function migrateLegacySession() {
  const legacy = takeLegacySession();
  if (!legacy?.accessToken || !legacy.refreshToken || !legacy.userType) return;
  await storeSession(legacy).catch(() => undefined);
}

async function requestRefresh(): Promise<string | null> {
  await migrateLegacySession();

  try {
    const res = await fetch(REFRESH_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 401) accessToken = null;
    if (!res.ok) return null;

    const body = (await res.json()) as { accessToken?: string };
    accessToken = body.accessToken ?? null;
    return accessToken;
  } catch {
    return null;
  }
}

export function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  refreshPromise ??= requestRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function ensureAccessToken(): Promise<string | null> {
  if (accessToken) return accessToken;
  if (!hasSession()) return null;
  return refreshAccessToken();
}

export async function setAuthSession(
  newAccessToken: string,
  refreshToken: string,
  userType: UserType,
) {
  await storeSession({ accessToken: newAccessToken, refreshToken, userType });
  accessToken = newAccessToken;
}

export async function clearAuthSession() {
  accessToken = null;
  if (typeof window === "undefined") return;

  takeLegacySession();
  await fetch(SESSION_API_PATH, { method: "DELETE" }).catch(() => undefined);
}
