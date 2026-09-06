"use client";

import * as React from "react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/date";
import { getGroupPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { trackSearchClick } from "@/services/search/searchClick";
import { GroupStatus } from "@/types/Group";

interface GroupCardData {
  uuid?: string;
  slug: string;
  name: string;
  thumbnailUrl?: string | null;
  shortDesc?: string;
  memberCount?: number;
  locationCountry?: string;
  status?: GroupStatus;
  mainCategory?: { name: string; slug: string } | null;
  mainCategoryName?: string;
  mainCategorySlug?: string;
  createdBy?: string;
  createdOn?: string;
}

interface GroupCardSearchContext {
  searchId?: string;
  query: string;
  position: number;
}

interface GroupCardProps {
  group: GroupCardData;
  className?: string;
  search?: GroupCardSearchContext;
}

function GroupCard({ group, className, search }: GroupCardProps) {
  const { user } = useUser();
  const addedByYou = Boolean(group.createdBy) && group.createdBy === user?.uuid;

  const handleClick = () => {
    if (!search || !group.uuid) return;
    trackSearchClick({ ...search, groupUuid: group.uuid });
  };

  return (
    <NextLink
      href={getGroupPath(group)}
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer flex-col gap-4 rounded-2xl border border-surface-line bg-surface-card p-5 text-left transition-shadow hover:shadow-md active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40",
        className,
      )}
    >
      <div className="flex flex-1 gap-4">
        <Avatar variant="tile" src={group.thumbnailUrl ?? undefined} name={group.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <Typography variant="h3" className="truncate font-semibold text-ink-1">
              {group?.name ?? NOT_APPLICABLE}
            </Typography>
            {addedByYou && <Chip label="Added by you" variant="filter" color="secondary" />}
          </div>
          <Typography variant="small" className="font-normal text-ink-3">
            {group?.shortDesc ?? NOT_APPLICABLE}
          </Typography>
          {group?.createdOn && (
            <Typography variant="tiny" className="mt-auto self-end text-ink-4">
              Since {formatDate(group.createdOn, "YYYY")}
            </Typography>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-surface-line" />

      <Typography variant="xs" className="font-mono tracking-[1px] text-ink-3 uppercase">
        {group?.mainCategory?.name ?? group?.mainCategoryName} ~{" "}
        {group?.memberCount?.toLocaleString()} Members ~ {group?.locationCountry}
      </Typography>
    </NextLink>
  );
}

export { GroupCard };
export type { GroupCardProps };
