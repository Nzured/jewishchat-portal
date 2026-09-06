"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EXTERNAL_GROUPS_NEW_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { loadPendingGroupDraft } from "@/lib/pendingGroupDraft";

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
