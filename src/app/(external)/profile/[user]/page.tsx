"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_HOME_PATH, EXTERNAL_PROFILE_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { UserService } from "@/services/user/user.service";
import { User } from "@/types/User";
import ProfileGroups from "../_components/ProfileGroups";

export default function MemberProfilePage() {
  const params = useParams<{ user: string }>();
  const uuid = params.user;
  const router = useRouter();
  const { user: sessionUser } = useUser();
  const [member, setMember] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const isSelf = Boolean(sessionUser) && sessionUser?.uuid === uuid;

  React.useEffect(() => {
    if (isSelf) router.replace(EXTERNAL_PROFILE_PATH);
  }, [isSelf, router]);

  React.useEffect(() => {
    if (!uuid) return;
    let ignore = false;

    UserService.getUserById(uuid)
      .then((res) => {
        if (!ignore) setMember(res?.data ?? null);
      })
      .catch(() => {
        if (!ignore) setMember(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [uuid]);

  const name = member ? `${member.firstName} ${member.lastName}`.trim() : "";

  return (
    <div className="flex w-full flex-col gap-8">
      <Breadcrumbs
        items={[{ label: "Home", href: EXTERNAL_HOME_PATH }, { label: name || "Member" }]}
      />

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : !member ? (
        <NoData title="Member not found" description="This profile is no longer available." />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <Avatar src={member.profilePic} name={name} size="xl" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Typography variant="h1" className="truncate font-display font-bold">
                {name}
              </Typography>
              <Typography variant="muted">Community member</Typography>
            </div>
          </div>

          {sessionUser && <ProfileGroups userUuid={member.uuid} />}
        </>
      )}
    </div>
  );
}
