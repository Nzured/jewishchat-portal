"use client";

import * as React from "react";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { useUser } from "@/contexts/UserContext";
import { useJoinGroup } from "@/hooks/useJoinGroup";
import { formatLocation } from "@/lib/location";
import { cn } from "@/lib/utils";
import { Category } from "@/types/Category";
import { Group, GroupStatus } from "@/types/Group";

interface GroupSummaryProps {
  group: Group;
  className?: string;
}

function collectCategories(group: Group): Category[] {
  const all = [group.mainCategory, ...(group.categories ?? [])].filter(Boolean);
  const seen = new Set<number>();

  return all.filter((category) => {
    if (seen.has(category.id)) return false;
    seen.add(category.id);
    return true;
  });
}

export function GroupSummary({ group, className }: GroupSummaryProps) {
  const router = useRouter();
  const { user } = useUser();
  const { join, isJoining } = useJoinGroup(group.slug);

  const location = formatLocation(group);
  const categories = collectCategories(group);
  const isOwner = Boolean(user) && user?.uuid === group.submittedByUuid;
  const linkLocked = group.linkVisibilityLoggedInOnly && !user;
  const canJoin = group.status === GroupStatus.ACTIVE && !linkLocked;
  const showJoinButton = !isOwner && (canJoin || linkLocked);

  const handleJoin = () => {
    if (linkLocked) {
      router.push("/login");
      return;
    }
    void join();
  };

  return (
    <div className={cn("flex flex-col items-start gap-5", className)}>
      <Avatar
        variant="tile"
        size="xl"
        src={group.thumbnailUrl ?? undefined}
        name={group.name}
        className="rounded-2xl"
      />

      <div className="flex flex-col gap-3">
        <Typography
          variant="h2"
          className="font-display text-3xl font-bold tracking-tight text-ink-1"
        >
          {group.name}
        </Typography>

        {location && (
          <div className="flex items-center gap-1.5 text-ink-3">
            <MapPin className="size-3.5 shrink-0" />
            <Typography variant="xs" className="text-ink-3">
              {location}
            </Typography>
          </div>
        )}

        {group.memberCount > 0 && (
          <div className="flex items-center gap-1.5 text-ink-3">
            <Users className="size-3.5 shrink-0" />
            <Typography variant="xs" className="text-ink-3">
              +{group.memberCount.toLocaleString()} members
            </Typography>
          </div>
        )}
      </div>

      {showJoinButton && (
        <div className="flex flex-col gap-2">
          <Button
            className="w-fit bg-brand-deep hover:bg-brand-deep/90"
            rightIcon={<ArrowRight />}
            disabled={isJoining}
            onClick={handleJoin}
          >
            {linkLocked ? "Log in to join" : isJoining ? "Opening WhatsApp..." : "Join the group"}
          </Button>
          <Typography variant="tiny" className="text-ink-4">
            {linkLocked
              ? "The admin shares this link with logged-in members only"
              : "Free to join • opens in WhatsApp"}
          </Typography>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip key={category.id} label={category.name} />
          ))}
        </div>
      )}
    </div>
  );
}
