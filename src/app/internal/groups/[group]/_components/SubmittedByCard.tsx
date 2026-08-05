"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { UserService } from "@/services/user/user.service";
import { User, UserType } from "@/types/User";
import { SectionLabel } from "./SectionLabel";

interface SubmittedByCardProps {
  /** `Group.submittedByUuid`; absent while the group itself is still loading. */
  userUuid?: string;
  loading?: boolean;
}

export default function SubmittedByCard({ userUuid, loading }: SubmittedByCardProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [userLoading, setUserLoading] = React.useState(false);

  React.useEffect(() => {
    const uuid = userUuid;
    if (!uuid) return;
    let ignore = false;

    async function loadUser(id: string) {
      setUserLoading(true);
      try {
        const res = await UserService.getUser(id);
        if (!ignore) setUser(res?.data ?? null);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setUserLoading(false);
      }
    }

    void loadUser(uuid);

    return () => {
      ignore = true;
    };
  }, [userUuid]);

  const showSkeleton = loading || userLoading;
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  return (
    <Card>
      <CardHeader>
        <SectionLabel>Submitted By</SectionLabel>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {showSkeleton ? (
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ) : !user ? (
          <Typography variant="small" className="text-ink-3">
            Submitter details unavailable.
          </Typography>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar variant="circle" size="lg" name={name} src={user.profilePic} />
              <div className="flex min-w-0 flex-col gap-1">
                <Typography variant="small" className="truncate font-semibold text-ink-1">
                  {name}
                </Typography>
                <Typography variant="xs" className="truncate text-ink-3">
                  {user.userType === UserType.INTERNAL ? "Internal user" : "External user"}
                  {user.email && ` · ${user.email}`}
                </Typography>
              </div>
            </div>

            <Button
              size="sm"
              variant="default"
              color="primary"
              className="w-full justify-center"
              onClick={() => router.push(`/internal/users/${user.uuid}`)}
            >
              View profile
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
