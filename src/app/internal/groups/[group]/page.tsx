import { GroupAdminServer } from "@/services/group/group.admin.server";
import { GroupDetailClient } from "./_components/GroupDetailClient";

interface GroupDetailPageProps {
  params: Promise<{ group: string }>;
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { group: groupUuid } = await params;
  const initialGroup = await GroupAdminServer.getGroupByUuid(groupUuid);

  return <GroupDetailClient groupUuid={groupUuid} initialGroup={initialGroup} />;
}
