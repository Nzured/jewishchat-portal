import type { CreateGroupFormValues } from "@/types/Group";

const STORAGE_KEY = "pendingGroupDraft";

/**
 * Everything needed to resume the create-group stepper after a detour through
 * signup/login. `image` is dropped — a `File` can't survive `sessionStorage`,
 * so the photo step is simply re-shown (it's optional) after resuming.
 *
 * There's no saved step number: this is only ever captured on the stepper's
 * last step, and which step id that is can shift once the user is known
 * (e.g. the "Review" step only exists for unverified users) — so on restore
 * we always jump back to whatever the last step resolves to, not a stored id.
 */
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
