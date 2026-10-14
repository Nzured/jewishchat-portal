import { UserServer } from "@/services/user/user.server";
import { UserType } from "@/types/User";
import { UserDetailClient } from "./_components/UserDetailClient";

interface UserDetailPageProps {
  params: Promise<{ user: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { user: userId } = await params;
  const initialUser = await UserServer.getAdminUser(userId);
  const initialGroups =
    initialUser?.userType === UserType.EXTERNAL
      ? await UserServer.getAdminUserGroups(userId)
      : null;

  return (
    <UserDetailClient userId={userId} initialUser={initialUser} initialGroups={initialGroups} />
  );
}
