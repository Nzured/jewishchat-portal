"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Group } from "@/types/Group";
import GroupCategorizationCard from "./_components/GroupCategorizationCard";
import GroupEngagementCard from "./_components/GroupEngagementCard";
import GroupHeaderCard from "./_components/GroupHeaderCard";
import GroupModerationCard from "./_components/GroupModerationCard";
import GroupNavigation from "./_components/GroupNavigation";
import GroupOverviewCard from "./_components/GroupOverviewCard";
import GroupReportsCard from "./_components/GroupReportsCard";
import SubmittedByCard from "./_components/SubmittedByCard";
import { useAdminGroupContext } from "../_context/AdminGroupContext";

export default function GroupDetailPage() {
  const params = useParams<{ group: string }>();
  const groupUuid = params.group;
  const { fetchGroupByUuid } = useAdminGroupContext();
  const [group, setGroup] = React.useState<Group | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!groupUuid) return;
    let ignore = false;

    async function loadGroup() {
      setLoading(true);
      try {
        const res = await fetchGroupByUuid(groupUuid);
        if (!ignore) setGroup(res ?? null);
      } catch {
        if (!ignore) setGroup(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadGroup();

    return () => {
      ignore = true;
    };
  }, [groupUuid, fetchGroupByUuid]);

  return (
    <div className="flex flex-col gap-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <GroupNavigation />

      <GroupHeaderCard group={group} loading={loading} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-4 md:col-span-2">
          <GroupOverviewCard group={group} loading={loading} />
          <GroupCategorizationCard group={group} loading={loading} />
          <GroupEngagementCard group={group} loading={loading} />
          <GroupReportsCard group={group} loading={loading} />
        </div>

        <div className="flex flex-col gap-4">
          <GroupModerationCard group={group} loading={loading} onGroupChange={setGroup} />
          <SubmittedByCard userUuid={group?.submittedByUuid} loading={loading} />
        </div>
      </div>
    </div>
  );
}
