"use client";

import * as React from "react";
import { useUser } from "@/contexts/UserContext";
import { recordGroupView } from "@/services/group/groupView";
import { Group } from "@/types/Group";

export function GroupViewTracker({ group }: { group: Group }) {
  const { user, isLoading } = useUser();

  React.useEffect(() => {
    if (isLoading) return;

    const isOwner = Boolean(group.isOwnGroup || (user && user.uuid === group.submittedByUuid));
    if (isOwner) return;

    recordGroupView(group.uuid);
  }, [group.isOwnGroup, group.submittedByUuid, group.uuid, isLoading, user]);

  return null;
}
