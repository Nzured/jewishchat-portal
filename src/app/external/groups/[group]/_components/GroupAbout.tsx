"use client";

import * as React from "react";
import { Flag } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";
import { GroupAdminCard } from "./GroupAdminCard";
import { ReportGroupModal } from "./ReportGroupModal";

interface GroupAboutProps {
  group: Group;
  className?: string;
}

function toParagraphs(about?: string) {
  return (about ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function GroupAbout({ group, className }: GroupAboutProps) {
  const { user } = useUser();
  const isOwner = Boolean(user) && user?.uuid === group.submittedByUuid;
  const canReport = Boolean(user) && !isOwner;
  const paragraphs = toParagraphs(group.about || group.shortDesc);

  return (
    <div className={cn("flex flex-col items-start gap-6", className)}>
      <Typography
        variant="h2"
        className="font-display text-2xl font-bold tracking-tight text-ink-1 sm:text-3xl"
      >
        About the group
      </Typography>

      {paragraphs.length > 0 && (
        <div className="flex max-w-2xl flex-col gap-4">
          {paragraphs.map((paragraph, index) => (
            <Typography key={index} variant="small" className="leading-6 text-ink-2">
              {paragraph}
            </Typography>
          ))}
        </div>
      )}

      {canReport && (
        <ReportGroupModal
          groupUuid={group.uuid}
          groupName={group.name}
          trigger={
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-sm text-ink-3 transition-colors hover:text-state-danger focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
            >
              <Flag className="size-3.5 shrink-0" />
              <Typography variant="xs" className="text-inherit">
                Report this group
              </Typography>
            </button>
          }
        />
      )}

      <GroupAdminCard group={group} />
    </div>
  );
}
