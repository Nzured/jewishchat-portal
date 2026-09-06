"use client";

import * as React from "react";
import { Flag } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";
import { ReportGroupModal } from "./ReportGroupModal";

interface GroupAboutProps {
  group: Group;
  className?: string;
}

export function GroupAbout({ group, className }: GroupAboutProps) {
  const { user } = useUser();
  const isOwner = Boolean(user) && user?.uuid === group.submittedByUuid;
  const canReport = Boolean(user) && !isOwner;

  return (
    <div
      className={cn("flex flex-col items-start gap-3 border-t border-surface-line pt-8", className)}
    >
      <Typography variant="h4" className="tracking-tight text-ink-1">
        About this group
      </Typography>
      <div className="flex max-w-2xl flex-col">
        <Typography variant="small" className="leading-6 whitespace-pre-line text-ink-2">
          {group?.about || NOT_APPLICABLE}
        </Typography>
      </div>
      {canReport && (
        <div className="mt-5 flex w-full max-w-2xl flex-col gap-1 border-t border-surface-line pt-4">
          <ReportGroupModal
            groupUuid={group.uuid}
            groupName={group.name}
            trigger={
              <button
                type="button"
                className="flex w-fit cursor-pointer items-center gap-2 rounded-sm text-ink-3 transition-colors hover:text-state-danger focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
              >
                <Flag className="size-3.5 shrink-0" />
                <Typography variant="xs" className="text-inherit">
                  Report this group
                </Typography>
              </button>
            }
          />
          <Typography variant="tiny" className="text-ink-4">
            Tell us if the join link is broken or the listing does not belong here.
          </Typography>
        </div>
      )}
    </div>
  );
}
