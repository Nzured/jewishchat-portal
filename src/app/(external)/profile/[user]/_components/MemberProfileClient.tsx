"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EXTERNAL_PROFILE_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import ProfileGroups from "../../_components/ProfileGroups";

export function MemberProfileClient({ memberUuid }: { memberUuid: string }) {
  const router = useRouter();
  const { user: sessionUser } = useUser();
  const isSelf = sessionUser?.uuid === memberUuid;

  React.useEffect(() => {
    if (isSelf) router.replace(EXTERNAL_PROFILE_PATH);
  }, [isSelf, router]);

  if (!sessionUser || isSelf) return null;

  return <ProfileGroups userUuid={memberUuid} />;
}
