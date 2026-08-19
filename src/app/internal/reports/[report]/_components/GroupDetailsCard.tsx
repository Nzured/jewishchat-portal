"use client";

import * as React from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/Collapsible";
import { Link } from "@/components/ui/Link";
import { LinkDisplay } from "@/components/ui/LinkDisplay";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE, PUBLIC_HOST } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { formatDate } from "@/lib/date";
import { getGroupPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { Group, GroupStatus } from "@/types/Group";

interface GroupDetailsCardProps {
  group?: Partial<Group>;
}

const STATUS_CHIP_TYPE = {
  [GroupStatus.STARTED]: "neutral",
  [GroupStatus.ACTIVE]: "success",
  [GroupStatus.SUSPENDED]: "error",
  [GroupStatus.PENDING]: "warning",
  [GroupStatus.IN_PROGRESS]: "info",
  [GroupStatus.PENDING_MODERATION]: "warning",
  [GroupStatus.MANUAL_REVIEW]: "warning",
} as const;

export default function GroupDetailsCard({ group }: GroupDetailsCardProps) {
  const [open, setOpen] = React.useState(true);

  const owner = group?.owner;
  const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.trim() : "";

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar
            variant={"tile"}
            size="lg"
            src={group?.thumbnailUrl ?? undefined}
            name={group?.name}
          />
          <div className="flex flex-1 flex-col items-start gap-1">
            <Typography variant={"large"} className="text-ink-1 font-semibold">
              {group?.name ?? NOT_APPLICABLE}
            </Typography>
            <Chip
              shape="pill"
              type={group?.status ? STATUS_CHIP_TYPE[group.status] : "neutral"}
              label={wordFormatter(group?.status)}
            />
          </div>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={open ? "Collapse group details" : "Expand group details"}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-bg hover:text-ink-1"
            >
              <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="flex flex-col">
            {group?.slug && (
              <div className="flex flex-col gap-3">
                <div></div>
                <div>
                  <LinkDisplay
                    url={`${PUBLIC_HOST}${getGroupPath({ slug: group.slug, mainCategory: group.mainCategory })}`}
                  />
                </div>
              </div>
            )}
            <Typography
              variant={"xs"}
              className="text-ink-4 font-medium my-3 mt-6 font-mono tracking-[1.5px]"
            >
              CATEGORIES
            </Typography>
            <div className="flex flex-row gap-2">
              {group?.mainCategory && (
                <Chip shape="rounded" label={wordFormatter(group.mainCategory.name)} type="info" />
              )}
              {group?.categories?.map((category) => {
                return (
                  <Chip key={category.slug} shape="rounded" label={wordFormatter(category.name)} />
                );
              })}
            </div>
            <div className="flex flex-row justify-between my-2 mt-6">
              <Typography variant={"xs"} className="text-ink-3 font-regular">
                Members
              </Typography>
              <Typography variant={"xs"} className="text-ink-2 font-medium">
                {group?.memberCount ?? NOT_APPLICABLE}
              </Typography>
            </div>
            <Separator />
            <div className="flex flex-row justify-between my-3">
              <Typography variant={"xs"} className="text-ink-3 font-regular">
                Added
              </Typography>
              <Typography variant={"xs"} className="text-ink-2 font-medium">
                {group?.createdOn ? formatDate(group.createdOn) : NOT_APPLICABLE}
              </Typography>
            </div>
            <Separator />
            <Typography
              variant={"xs"}
              className="text-ink-4 font-medium my-3 mt-6 font-mono tracking-[1.5px]"
            >
              CREATED BY
            </Typography>
            {owner ? (
              <div className="flex flex-row items-center gap-3 rounded-xl border border-surface-line bg-surface-bg p-3">
                <Avatar variant="circle" name={ownerName} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Typography variant={"xs"} className="truncate font-semibold text-ink-1">
                    {ownerName}
                  </Typography>
                  <Typography variant={"xs"} className="text-ink-3 font-regular">
                    Owner
                  </Typography>
                </div>
                <Link href={`/internal/users/${owner.uuid}`} className="shrink-0 text-xs">
                  View profile
                  <ArrowRight className="size-3.5 shrink-0" />
                </Link>
              </div>
            ) : (
              <Typography variant={"xs"} className="text-ink-3 font-regular">
                {NOT_APPLICABLE}
              </Typography>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
