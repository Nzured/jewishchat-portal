"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EXTERNAL_GROUPS_NEW_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { loadPendingGroupDraft } from "@/lib/pendingGroupDraft";

/**
 * A signed-out user who reaches the last step of "Add a group" is sent to
 * sign in/up with their progress saved to `sessionStorage` (see the create
 * group page's auth-required modal). Once they're back and authenticated
 * anywhere in the external app, this sends them straight back to resume it —
 * the create-group page itself consumes and clears the saved draft.
 */
export function PendingGroupDraftRedirect() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user || pathname === EXTERNAL_GROUPS_NEW_PATH) return;
    if (loadPendingGroupDraft()) router.replace(EXTERNAL_GROUPS_NEW_PATH);
  }, [user, pathname, router]);

  return null;
}
