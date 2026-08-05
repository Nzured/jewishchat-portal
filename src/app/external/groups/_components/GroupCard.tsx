import * as React from "react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_PATH, NOT_APPLICABLE } from "@/configs/const";
import { cn } from "@/lib/utils";
import { GroupStatus } from "@/types/Group";

/**
 * Only what the card actually renders — satisfied structurally by both a
 * full `Group` (browse/admin listings) and the leaner `SearchGroupResult`
 * (search results, which has no `status` and a flat `mainCategoryName`
 * instead of a `mainCategory` object).
 */
interface GroupCardData {
  slug: string;
  name: string;
  shortDesc?: string;
  memberCount?: number;
  locationCountry?: string;
  status?: GroupStatus;
  mainCategory?: { name: string } | null;
  mainCategoryName?: string;
}

interface GroupCardProps {
  group: GroupCardData;
  className?: string;
}

function GroupCard({ group, className }: GroupCardProps) {
  return (
    <NextLink
      href={`${EXTERNAL_GROUPS_PATH}/${group.slug}`}
      className={cn(
        "flex cursor-pointer flex-col gap-4 rounded-2xl border border-surface-line bg-surface-card p-5 text-left transition-shadow hover:shadow-md active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40",
        className,
      )}
    >
      <div className="flex flex-1 items-start justify-between gap-3">
        <div className="flex items-flex-start gap-4">
          <Avatar variant="tile" src={""} name={group.name} />
          <div className="flex-col">
            <Typography variant="h2" className="font-semibold text-ink-1">
              {group?.name ?? NOT_APPLICABLE}
            </Typography>
            <Typography variant="small" className="font-normal text-ink-3">
              {group?.shortDesc ?? NOT_APPLICABLE}
            </Typography>
          </div>
        </div>
        {group.status === GroupStatus.ACTIVE && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink-1 px-3 py-1">
            <span className="size-1.5 shrink-0 rounded-full bg-state-success" />
            <Typography variant="xs" className="font-mono tracking-[1px] text-white uppercase">
              Active
            </Typography>
          </span>
        )}
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
