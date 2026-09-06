import type { CreateGroupFormValues } from "@/types/Group";

const STORAGE_KEY = "pendingGroupDraft";

export interface PendingGroupDraft {
  draftId: string;
  values: Omit<CreateGroupFormValues, "image">;
}

export function savePendingGroupDraft(draft: PendingGroupDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadPendingGroupDraft(): PendingGroupDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingGroupDraft) : null;
  } catch {
    return null;
  }
}

export function clearPendingGroupDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
