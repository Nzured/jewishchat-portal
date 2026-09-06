import { GROUP_VIEW_DEDUPE_MS } from "@/configs/const";
import { getVisitorFingerprint } from "@/lib/visitor";
import { takeSearchAttribution } from "@/services/search/searchClick";
import { GroupService } from "./group.service";

const STORAGE_KEY = "groupViews";

type ViewLog = Record<string, number>;

const memoryLog: ViewLog = {};

function readStoredLog(): ViewLog {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ViewLog) : {};
  } catch {
    return {};
  }
}

function writeStoredLog(log: ViewLog): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    return;
  }
}

function claimView(uuid: string): boolean {
  const now = Date.now();
  const log = { ...readStoredLog(), ...memoryLog };
  const lastViewedAt = log[uuid];

  if (lastViewedAt && now - lastViewedAt < GROUP_VIEW_DEDUPE_MS) return false;

  memoryLog[uuid] = now;

  const fresh: ViewLog = { [uuid]: now };
  Object.entries(log).forEach(([key, viewedAt]) => {
    if (key !== uuid && now - viewedAt < GROUP_VIEW_DEDUPE_MS) fresh[key] = viewedAt;
  });

  writeStoredLog(fresh);

  return true;
}

export function recordGroupView(uuid: string): void {
  if (typeof window === "undefined") return;
  if (!claimView(uuid)) return;

  GroupService.recordGroupView(uuid, {
    fingerprint: getVisitorFingerprint(),
    referralSource: document.referrer || undefined,
    searchQuery: takeSearchAttribution(uuid),
  }).catch(() => {});
}
