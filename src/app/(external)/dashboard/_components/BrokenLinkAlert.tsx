"use client";

import { Link2Off } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_MINE_PATH } from "@/configs/const";
import { BrokenLinkAlert as BrokenLinkAlertData } from "@/types/OwnerDashboard";

interface BrokenLinkAlertProps {
  alert: BrokenLinkAlertData | null | undefined;
}

export function BrokenLinkAlert({ alert }: BrokenLinkAlertProps) {
  if (!alert?.show || alert.unsuccessfulClicks <= 0) return null;

  const count = alert.unsuccessfulClicks;
  const people = count === 1 ? "person" : "people";

  return (
    <div
      role="alert"
      className="flex w-full flex-col gap-3 rounded-lg border border-surface-line-strong bg-state-bg-error p-3 sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-start gap-3">
        <span className="mt-0.5 shrink-0 text-state-error [&_svg]:size-4">
          <Link2Off />
        </span>
        <div className="flex flex-col gap-0.5">
          <Typography as="p" variant="small" className="font-semibold text-ink-1">
            Your invite link appears broken - {count.toLocaleString()} {people} tried to join and
            couldn&apos;t.
          </Typography>
          <Typography as="p" variant="xs" className="text-ink-3">
            Visitors clicked Join Group but the WhatsApp link didn&apos;t work. Update it to stop
            losing members.
          </Typography>
        </div>
      </div>
      <div className="shrink-0 pl-7 sm:pl-0">
        <Button asChild size="sm" color="danger">
          <NextLink href={EXTERNAL_GROUPS_MINE_PATH}>Update invite link</NextLink>
        </Button>
      </div>
    </div>
  );
}
