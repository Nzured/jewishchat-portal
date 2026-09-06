"use client";

import { BadgeCheck, Clock, LocateIcon, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { GroupSuspensionBanner } from "@/components/ui/GroupSuspensionBanner";
import { Typography } from "@/components/ui/Typography";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/date";
import { formatLocation } from "@/lib/location";
import { Group } from "@/types/Group";
import { GroupJoinActions } from "./GroupJoinActions";

export function GroupHeader({ group }: { group: Group }) {
  const { user } = useUser();
  const isOwner = Boolean(group.isOwnGroup || (user && user.uuid === group.submittedByUuid));

  return (
    <div className="flex flex-col gap-5">
      <GroupSuspensionBanner group={group} showResubmitHint={isOwner} />

      <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
        <Avatar
          size="2xl"
          name={group.name}
          src={group.thumbnailUrl ?? undefined}
          className="rounded-2xl"
        />
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Typography variant="h1" className="font-bold text-ink-1">
              {group.name}
            </Typography>
            {isOwner && (
              <Chip
                type="success"
                shape="pill"
                leftIcon={<BadgeCheck className="size-3.5" />}
                label="Your group"
              />
            )}
          </div>

          <Typography variant="p" className="text-ink-2">
            {group.shortDesc}
          </Typography>
          <div className="flex flex-row flex-wrap items-center gap-x-5 gap-y-2">
            {(group.locationCountry || group.locationState || group.locationCity) && (
              <div className="flex flex-row items-center gap-1.5">
                <LocateIcon className="text-ink-3 size-4" />
                <Typography variant="small" className="text-ink-3">
                  {formatLocation(group)}
                </Typography>
              </div>
            )}

            {group.memberCount > 0 && (
              <div className="flex flex-row items-center gap-1.5">
                <Users className="text-ink-3 size-4" />
                <Typography variant={"small"} className="text-ink-3">
                  {group.memberCount} members
                </Typography>
              </div>
            )}
            {group.createdOn && (
              <div className="flex flex-row items-center gap-1.5">
                <Clock className="text-ink-3 size-4" />
                <Typography variant="small" className="text-ink-3">
                  Listed {formatDate(group.createdOn)}
                </Typography>
              </div>
            )}
          </div>
          <div className="flex flex-row flex-wrap items-center gap-1.5">
            {group.mainCategory.name && (
              <Chip type="success" shape="rounded" label={group.mainCategory?.name} />
            )}
            {group.categories.map((category) => (
              <Chip key={category.id} shape="rounded" label={category.name} />
            ))}
          </div>
          <GroupJoinActions group={group} className="mt-2" />
        </div>
      </div>
    </div>
  );
}
