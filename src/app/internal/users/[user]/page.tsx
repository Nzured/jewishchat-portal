import { UserServer } from "@/services/user/user.server";
import { UserDetailClient } from "./_components/UserDetailClient";

interface UserDetailPageProps {
  params: Promise<{ user: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { user: userId } = await params;
  const [initialUser, initialGroups] = await Promise.all([
    UserServer.getAdminUser(userId),
    UserServer.getAdminUserGroups(userId),
  ]);

  return (
    <UserDetailClient userId={userId} initialUser={initialUser} initialGroups={initialGroups} />
  );
}
