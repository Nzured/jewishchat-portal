import { COOKIE_CONSENT_COOKIE, COOKIE_CONSENT_MAX_AGE } from "@/configs/const";

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
}

export const COOKIE_CONSENT_EVENT = "cookie-consent-change";

const ANALYTICS_STORAGE_KEYS = {
  local: ["visitorFingerprint"],
  session: ["groupViews", "searchAttribution"],
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function readCookieConsent(): CookieConsent | null {
  const raw = readCookie(COOKIE_CONSENT_COOKIE);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof parsed.analytics !== "boolean") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function clearAnalyticsStorage() {
  try {
    ANALYTICS_STORAGE_KEYS.local.forEach((key) => localStorage.removeItem(key));
    ANALYTICS_STORAGE_KEYS.session.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    return;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };

  document.cookie = `${COOKIE_CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE}; SameSite=Lax`;

  if (!analytics) clearAnalyticsStorage();

  window.dispatchEvent(new CustomEvent<CookieConsent>(COOKIE_CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.analytics === true;
}

let snapshotCache: { raw: string | null; consent: CookieConsent | null } = {
  raw: null,
  consent: null,
};

export function subscribeCookieConsent(callback: () => void): () => void {
  window.addEventListener(COOKIE_CONSENT_EVENT, callback);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
}

export function getCookieConsentSnapshot(): CookieConsent | null {
  const raw = readCookie(COOKIE_CONSENT_COOKIE);
  if (raw !== snapshotCache.raw) {
    snapshotCache = { raw, consent: readCookieConsent() };
  }
  return snapshotCache.consent;
}

export function getCookieConsentServerSnapshot(): undefined {
  return undefined;
}
