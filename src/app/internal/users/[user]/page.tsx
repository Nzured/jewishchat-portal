"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { CopyButton } from "@/components/ui/CopyButton";
import { Typography } from "@/components/ui/Typography";
import { GroupStatus } from "@/types/Group";
import { User, UserStatus } from "@/types/User";
import AccountDetailsCard from "./_components/AccountDetailsCard";
import UserGroupsSection, { UserGroupEntry } from "./_components/UserGroupsSection";
import UserModerationCard from "./_components/UserModerationCard";
import UserNavigation from "./_components/UserNavigation";
import { useUserManagementContext } from "../_context/UserManagementContext";

const MOCK_GROUPS: UserGroupEntry[] = [
  {
    id: "g1",
    groupName: "Lakewood Auto Traders",
    path: "/g/lakewood-auto-traders",
    category: "Marketplace",
    status: GroupStatus.ACTIVE,
    views: 18420,
  },
  {
    id: "g2",
    groupName: "Lakewood Kallah Fund",
    path: "/g/lakewood-kallah-fund",
    category: "Chesed",
    status: GroupStatus.ACTIVE,
    views: 9310,
  },
  {
    id: "g3",
    groupName: "Toms River Carpool",
    path: "/g/toms-river-carpool",
    category: "Transport",
    status: GroupStatus.ACTIVE,
    views: 4205,
  },
  {
    id: "g4",
    groupName: "Passaic Produce Co-op",
    path: "/g/passaic-produce-coop",
    category: "Food",
    status: GroupStatus.SUSPENDED,
    views: 2870,
  },
];

const LAST_ACTIVE_OPTIONS = ["2h ago", "5h ago", "1d ago", "3d ago", "Just now", "30m ago"];

export default function UserDetailPage() {
  const params = useParams<{ user: string }>();
  const userId = params.user;
  // const user = ALL_USERS.find((u) => u.id === userId) ?? ALL_USERS[0];
  // const index = ALL_USERS.indexOf(user);
  // const lastActive = LAST_ACTIVE_OPTIONS[index % LAST_ACTIVE_OPTIONS.length];
  const { fetchUserDetails } = useUserManagementContext();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId)
        .then((res) => {
          if (res) setUser(res);
        })
        .catch(() => {});
    }
  }, [userId, fetchUserDetails]);

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
          {user && <UserGroupsSection groups={MOCK_GROUPS} />}
        </div>
        <div>{user && <UserModerationCard user={user} />}</div>
      </div>
    </div>
  );
}
