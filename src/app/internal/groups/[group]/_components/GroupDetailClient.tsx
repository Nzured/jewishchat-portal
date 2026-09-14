"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Banner } from "@/components/ui/Banner";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/date";
import { Group, GroupStatus } from "@/types/Group";
import GroupCategorizationCard from "./GroupCategorizationCard";
import GroupEngagementCard from "./GroupEngagementCard";
import GroupHeaderCard from "./GroupHeaderCard";
import GroupModerationCard from "./GroupModerationCard";
import GroupNavigation from "./GroupNavigation";
import GroupOverviewCard from "./GroupOverviewCard";
import GroupReportsCard from "./GroupReportsCard";
import SubmittedByCard from "./SubmittedByCard";
import { useAdminGroupContext } from "../../_context/AdminGroupContext";

interface GroupSuspension {
  reasonLabel: string;
  remark: string;
  suspendedAt: string;
  suspendedBy: string;
}

interface GroupDetailClientProps {
  groupUuid: string;
  initialGroup: Group | null;
}

export function GroupDetailClient({ groupUuid, initialGroup }: GroupDetailClientProps) {
  const { fetchGroupByUuid } = useAdminGroupContext();
  const { user } = useUser();
  const [group, setGroup] = React.useState<Group | null>(initialGroup);
  const [loading, setLoading] = React.useState(!initialGroup);
  const [suspension, setSuspension] = React.useState<GroupSuspension | null>(null);
  const hydratedUuid = React.useRef<string | null>(initialGroup ? groupUuid : null);

  React.useEffect(() => {
    if (!groupUuid) return;
    if (hydratedUuid.current === groupUuid) {
      hydratedUuid.current = null;
      return;
    }
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

      {group?.status === GroupStatus.SUSPENDED && suspension && (
        <Banner
          variant="warning"
          icon={<AlertTriangle />}
          title={`Suspended on ${suspension.suspendedAt}${suspension.suspendedBy ? ` by ${suspension.suspendedBy}` : ""}`}
          description={`Reason: ${suspension.reasonLabel}${suspension.remark ? ` ${suspension.remark}` : ""}. Hidden from the directory and search until it is re-listed.`}
        />
      )}

      <GroupHeaderCard group={group} loading={loading} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-4 md:col-span-2">
          <GroupOverviewCard group={group} loading={loading} />
          <GroupCategorizationCard group={group} loading={loading} />
          <GroupEngagementCard group={group} loading={loading} />
          <GroupReportsCard group={group} loading={loading} />
        </div>

        <div className="flex flex-col gap-4">
          <GroupModerationCard
            group={group}
            loading={loading}
            onGroupChange={setGroup}
            onSuspended={(data) =>
              setSuspension({
                reasonLabel: data.reasonLabel,
                remark: data.remark,
                suspendedAt: formatDate(new Date()),
                suspendedBy: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
              })
            }
            onRelisted={() => setSuspension(null)}
          />
          <SubmittedByCard userUuid={group?.submittedByUuid} loading={loading} />
        </div>
      </div>
    </div>
  );
}
