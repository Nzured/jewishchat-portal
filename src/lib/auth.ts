import { ACCESS_TOKEN_COOKIE, COOKIE_MAX_AGE, USER_TYPE_COOKIE } from "@/configs/const";
import { UserType } from "@/types/User";

const AUTH_STORAGE_KEY = "auth";

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  userType: UserType;
}

function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function getHomePathForUserType(userType: UserType) {
  return userType === UserType.INTERNAL ? "/internal" : "/external";
}

export function getAccessToken(): string | null {
  return getStoredAuth()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getStoredAuth()?.refreshToken ?? null;
}

export function setAuthSession(accessToken: string, refreshToken: string, userType: UserType) {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${accessToken}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${USER_TYPE_COOKIE}=${userType}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, userType }));
}

// Called after a silent refresh: keeps the existing userType, only rotates tokens.
export function updateAccessToken(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;

  const userType = getStoredAuth()?.userType;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${accessToken}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, userType }));
}

export function clearAuthSession() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${USER_TYPE_COOKIE}=; path=/; max-age=0`;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
