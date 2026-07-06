"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { UserRef } from "@/types/User";

interface UserCardProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserRef;
  role?: string;
  href?: string;
}

export function UserCard({ user, role = "Owner", href = "#", className, ...props }: UserCardProps) {
  const formattedDate = React.useMemo(
    () => formatDate(user.joinedDate, "MMM YYYY"),
    [user.joinedDate],
  );

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-4 rounded-xl border border-surface-line bg-surface-bg p-3 px-4",
        className,
      )}
      {...props}
    >
      <div className="flex flex-row items-center gap-3">
        <Avatar variant="circle" size="lg" src={user.profilePic} name={user.name} />
        <div className="flex flex-col">
          <Typography variant="p" className="text-sm font-semibold text-ink-1 leading-none">
            {user.name}
          </Typography>
          <Typography variant="xs" className="text-ink-3 mt-1.5 leading-none">
            {role} &middot; joined {formattedDate}
          </Typography>
        </div>
      </div>
      <Link
        href={href}
        arrow
        className="flex flex-row items-center gap-1 text-[13px] font-medium text-brand-green hover:underline focus-visible:outline-none"
      >
        View profile
      </Link>
    </div>
  );
}
