"use client";

import * as React from "react";
import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { UserService } from "@/services/user/user.service";
import { Group } from "@/types/Group";
import { User } from "@/types/User";

interface GroupAdminCardProps {
  group: Group;
  className?: string;
}

const cardClasses =
  "flex w-fit items-center gap-3 rounded-2xl border border-surface-line bg-surface-card p-3 pr-6";

export function GroupAdminCard({ group, className }: GroupAdminCardProps) {
  const ownerUuid = group.submittedByUuid;
  const [owner, setOwner] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(Boolean(ownerUuid));

  React.useEffect(() => {
    if (!ownerUuid) return;

    let ignore = false;

    UserService.getUserById(ownerUuid)
      .then((res) => {
        if (!ignore) setOwner(res.data);
      })
      .catch(() => {
        if (!ignore) setOwner(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [ownerUuid]);

  if (isLoading) {
    return (
      <div className={cn(cardClasses, className)}>
        <Skeleton className="size-6 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
      </div>
    );
  }

  if (!owner) return null;

  const ownerName = `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim();

  return (
    <div className={cn(cardClasses, className)}>
      <Avatar
        variant="circle"
        size="lg"
        name={ownerName}
        src={owner.profilePic ?? group.ownerProfileUrl}
        alt={ownerName}
      />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-brand-green">
          <Typography variant="xs" className="font-mono tracking-[1px] text-brand-green uppercase">
            Group admin
          </Typography>
          <BadgeCheck className="size-3.5 shrink-0" />
        </div>
        {ownerName && (
          <Typography variant="large" className="font-semibold text-ink-1">
            {ownerName}
          </Typography>
        )}
      </div>
    </div>
  );
}
