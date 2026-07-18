"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { Typography } from "@/components/ui/Typography";
import { Group } from "@/types/Group";
import { User, UserStatus, UserType } from "@/types/User";
import AccountDetailsCard from "./_components/AccountDetailsCard";
import UserGroupsSection from "./_components/UserGroupsSection";
import UserModerationCard from "./_components/UserModerationCard";
import UserNavigation from "./_components/UserNavigation";
import { useUserManagementContext } from "../_context/UserManagementContext";

export default function UserDetailPage() {
  const params = useParams<{ user: string }>();
  const userId = params.user;
  const { fetchUserDetails, fetchGroupsByUser } = useUserManagementContext();
  const [user, setUser] = useState<User | null>(null);
  const [userGroups, setUserGroups] = useState<Group[] | null>(null);

  useEffect(() => {
    if (userId) {
      Promise.all([fetchGroupsByUser(userId), fetchUserDetails(userId)])
        .then(([groupsRes, userRes]) => {
          if (groupsRes) setUserGroups(groupsRes);
          if (userRes) setUser(userRes);
        })
        .catch(() => {});
    }
  }, [userId, fetchUserDetails, fetchGroupsByUser]);

  return (
    <div className="flex flex-col gap-4">
      <UserNavigation />

      <Card className="flex gap-4  flex-row px-5 py-4">
        <Avatar
          variant="circle"
          size={"xl"}
          name={user?.firstName + " " + user?.lastName}
          src={user?.profilePic}
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <Typography variant="h2" className="font-medium text-ink-1">
              {user?.firstName + " " + user?.lastName}
            </Typography>
            <Chip
              shape="pill"
              type={user?.status === UserStatus.ACTIVE ? "success" : "error"}
              label={user?.status === UserStatus.ACTIVE ? "Active" : "Suspended"}
            />
          </div>
          <div className="flex items-center gap-2 text-ink-3">
            <Mail className="size-4 shrink-0" />
            <Typography variant="small" className="text-ink-3">
              {user?.email}
            </Typography>
            {user?.email && <CopyButton value={user?.email} aria-label="Copy email" />}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
          {user && <AccountDetailsCard user={user} />}
          {userGroups && user?.userType === UserType.EXTERNAL && (
            <UserGroupsSection groups={userGroups} />
          )}
        </div>
        <div>{user && <UserModerationCard user={{ ...user, id: user.uuid }} />}</div>
      </div>
    </div>
  );
}
