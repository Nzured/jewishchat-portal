"use client";

import { CalendarDays, MapPin, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE, PUBLIC_HOST } from "@/configs/const";
import { formatDate } from "@/lib/date";
import { getGroupPath } from "@/lib/publicPaths";
import { Group } from "@/types/Group";
import { StatusPill } from "../../_components/StatusPill";

function formatLocation(group: Group) {
  return [group.locationCity, group.locationState].filter(Boolean).join(", ");
}

interface GroupHeaderCardProps {
  group: Group | null;
  loading?: boolean;
}

export default function GroupHeaderCard({ group, loading }: GroupHeaderCardProps) {
  if (loading) {
    return (
      <Card className="flex flex-row gap-4 px-5 py-4">
        <Skeleton className="size-11 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card className="px-5 py-4">
        <Typography variant="small" className="text-ink-3">
          Group not found.
        </Typography>
      </Card>
    );
  }

  const publicUrl = `${PUBLIC_HOST}${getGroupPath(group)}`;
  const location = formatLocation(group);

  return (
    <Card className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar variant="tile" size="lg" src={group.thumbnailUrl ?? undefined} name={group.name} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <Typography variant="h4" className="font-semibold text-ink-1">
              {group.name}
            </Typography>
            <StatusPill status={group.status} />
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Typography variant="tiny" className="truncate font-mono text-ink-3 select-all">
              {publicUrl}
            </Typography>
            <CopyButton
              value={`https://${publicUrl}`}
              aria-label="Copy group link"
              className="shrink-0 text-ink-3 hover:text-brand-green"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:shrink-0">
        <div className="flex items-center gap-1.5 text-ink-3">
          <Users className="size-4 shrink-0" />
          <Typography variant="small" className="text-ink-3">
            <span className="font-semibold tabular-nums text-ink-1">
              {group.memberCount.toLocaleString()}
            </span>{" "}
            members
          </Typography>
        </div>

        {location && (
          <div className="flex items-center gap-1.5 text-ink-3">
            <MapPin className="size-4 shrink-0" />
            <Typography variant="small" className="text-ink-3">
              {location}
            </Typography>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-ink-3">
          <CalendarDays className="size-4 shrink-0" />
          <Typography variant="small" className="text-ink-3">
            Added{" "}
            <span className="font-medium text-ink-1">
              {group.createdOn ? formatDate(group.createdOn) : NOT_APPLICABLE}
            </span>
          </Typography>
        </div>
      </div>
    </Card>
  );
}
