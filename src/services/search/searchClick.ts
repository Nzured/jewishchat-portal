import { SEARCH_ATTRIBUTION_TTL_MS } from "@/configs/const";
import { postBeacon } from "@/lib/beacon";
import { getVisitorFingerprint } from "@/lib/visitor";
import { SEARCH_SERVICE } from "./search.service";

const SEARCH_CLICK_PATH = `${SEARCH_SERVICE}/analytics/search-click`;
const ATTRIBUTION_KEY = "searchAttribution";

export interface SearchClick {
  searchId?: string;
  groupUuid: string;
  query: string;
  position: number;
}

interface StoredAttribution {
  groupUuid: string;
  query: string;
  at: number;
}

function rememberAttribution(attribution: StoredAttribution): void {
  try {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    return;
  }
}

export function trackSearchClick({ searchId, groupUuid, query, position }: SearchClick): void {
  if (typeof window === "undefined") return;

  const term = query.trim();
  if (!term) return;

  rememberAttribution({ groupUuid, query: term, at: Date.now() });

  postBeacon(SEARCH_CLICK_PATH, {
    searchId,
    groupUuid,
    query: term,
    position,
    visitorId: getVisitorFingerprint(),
  });
}

export function takeSearchAttribution(groupUuid: string): string | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return undefined;

    sessionStorage.removeItem(ATTRIBUTION_KEY);

    const stored = JSON.parse(raw) as StoredAttribution;
    if (stored.groupUuid !== groupUuid) return undefined;
    if (Date.now() - stored.at > SEARCH_ATTRIBUTION_TTL_MS) return undefined;

    return stored.query || undefined;
  } catch {
    return undefined;
  }
}
