"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";
import { USER_STATUS_CHIP, User, UserType } from "@/types/User";
import AccountDetailsCard from "./_components/AccountDetailsCard";
import { ManageRolesModal } from "./_components/ManageRolesModal";
import UserGroupsSection from "./_components/UserGroupsSection";
import UserModerationCard from "./_components/UserModerationCard";
import UserNavigation from "./_components/UserNavigation";
import UserRoleCard from "./_components/UserRoleCard";
import { useUserManagementContext } from "../_context/UserManagementContext";

export default function UserDetailPage() {
  const params = useParams<{ user: string }>();
  const userId = params.user;
  const { fetchUserDetails, fetchGroupsByUser } = useUserManagementContext();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [moderationVisible, setModerationVisible] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;

    async function loadUser() {
      setUserLoading(true);
      try {
        const res = await fetchUserDetails(userId);
        if (!ignore && res) setUser(res);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setUserLoading(false);
      }
    }

    async function loadGroups() {
      setGroupsLoading(true);
      try {
        const res = await fetchGroupsByUser(userId);
        if (!ignore) setUserGroups(res ?? []);
      } catch {
        if (!ignore) setUserGroups([]);
      } finally {
        if (!ignore) setGroupsLoading(false);
      }
    }

    void loadUser();
    void loadGroups();

    return () => {
      ignore = true;
    };
  }, [userId, fetchUserDetails, fetchGroupsByUser]);

  return (
    <div className="flex flex-col gap-4 pb-20 md:pb-0">
      <UserNavigation />

      <Card className="flex gap-4  flex-row px-5 py-4">
        {userLoading ? (
          <>
            <Skeleton className="size-15 rounded-full" />
            <div className="flex flex-col justify-center gap-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </>
        ) : user ? (
          <>
            <Avatar
              variant="circle"
              size={"xl"}
              name={`${user.firstName} ${user.lastName}`}
              src={user.profilePic}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <Typography variant="h2" className="font-medium text-ink-1">
                  {user.firstName} {user.lastName}
                </Typography>
                <Chip
                  shape="pill"
                  type={USER_STATUS_CHIP[user.status].type}
                  label={USER_STATUS_CHIP[user.status].label}
                />
              </div>
              <div className="flex items-center gap-2 text-ink-3">
                <Mail className="size-4 shrink-0" />
                <Typography variant="small" className="text-ink-3">
                  {user.email}
                </Typography>
                {user.email && <CopyButton value={user.email} aria-label="Copy email" />}
              </div>
            </div>
          </>
        ) : (
          <Typography variant="small" className="text-ink-3">
            User not found.
          </Typography>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className={cn(
            "flex flex-col gap-4",
            moderationVisible ? "md:col-span-2" : "md:col-span-3",
          )}
        >
          <AccountDetailsCard user={user} loading={userLoading} />
          {userLoading ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </CardContent>
            </Card>
          ) : user?.userType === UserType.EXTERNAL ? (
            <UserGroupsSection groups={userGroups ?? []} loading={groupsLoading} />
          ) : user?.userType === UserType.INTERNAL ? (
            <UserRoleCard
              roles={user?.roles ?? []}
              onManageRolesClick={() => setRolesModalOpen(true)}
            />
          ) : null}
        </div>
        <div className={cn(!moderationVisible && "hidden")}>
          <UserModerationCard
            user={user}
            loading={userLoading}
            onUserChange={(updatedUser) => setUser(updatedUser)}
            onVisibilityChange={setModerationVisible}
          />
        </div>
      </div>

      {user && (
        <ManageRolesModal
          open={rolesModalOpen}
          setOpen={setRolesModalOpen}
          userName={`${user.firstName} ${user.lastName}`}
          assignedRoles={user.roles}
          onSave={(roles) => setUser((prev) => (prev ? { ...prev, roles } : prev))}
        />
      )}
    </div>
  );
}
