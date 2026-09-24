"use client";

import { ReactNode } from "react";
import { CircleAlert, CircleCheck, Eye, MousePointerClick } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_MINE_PATH } from "@/configs/const";
import { cn } from "@/lib/utils";
import { InactiveGroupDetail, OwnerDashboardSummary } from "@/types/OwnerDashboard";
import { formatCount } from "./format";

type Tone = "success" | "warning" | "info";

const toneStyles: Record<Tone, string> = {
  success: "bg-state-bg-success text-state-success",
  warning: "bg-state-bg-warning text-state-warn",
  info: "bg-state-bg-info text-state-info",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone: Tone;
  loading?: boolean;
  footer?: ReactNode;
}

function StatCard({ label, value, icon, tone, loading, footer }: StatCardProps) {
  return (
    <Card className="gap-0 py-4">
      <div className="flex items-center gap-3 px-4">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
            toneStyles[tone],
          )}
        >
          {icon}
        </span>
        <Typography
          variant="tiny"
          as="span"
          className="font-mono font-medium tracking-[0.08em] text-ink-3 uppercase"
        >
          {label}
        </Typography>
      </div>
      <Typography
        variant="h2"
        as="div"
        className="mt-3 px-4 text-[30px] leading-none font-semibold tracking-tight text-ink-1 tabular-nums"
      >
        {loading ? <Skeleton className="h-8 w-16" /> : value}
      </Typography>
      <div className="mt-3 min-h-5 px-4">
        {loading ? <Skeleton className="h-4 w-28" /> : footer}
      </div>
    </Card>
  );
}

function InactiveGroupRow({ group }: { group: InactiveGroupDetail }) {
  const suspended = group.reason.toLowerCase().includes("suspend");
  return (
    <div className="flex items-center justify-between gap-2">
      <Typography variant="xs" as="span" className="min-w-0 truncate text-ink-2">
        {group.groupName}
      </Typography>
      <Chip
        variant="filter"
        shape="pill"
        type={suspended ? "error" : "warning"}
        label={group.reason}
        className="px-2 py-0.5"
      />
    </div>
  );
}

function InactiveGroupsFooter({ groups }: { groups: InactiveGroupDetail[] }) {
  if (groups.length === 0) {
    return (
      <Typography variant="xs" as="span" className="text-ink-4">
        All listings are live
      </Typography>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="xs" className="text-ink-2">
          Why inactive?
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        <div
          data-lenis-prevent
          className="thin-scrollbar flex max-h-60 flex-col gap-2 overflow-y-auto overscroll-contain p-3"
        >
          {groups.map((group) => (
            <InactiveGroupRow key={group.groupUuid} group={group} />
          ))}
        </div>
        <div className="border-t border-surface-line p-2">
          <Button variant="secondary" color="primary" size="sm" className="w-full" asChild>
            <NextLink href={EXTERNAL_GROUPS_MINE_PATH}>Manage listings</NextLink>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface SummaryCardsProps {
  summary?: OwnerDashboardSummary;
  periodLabel: string;
  loading?: boolean;
}

export function SummaryCards({ summary, periodLabel, loading = false }: SummaryCardsProps) {
  const inactiveDetails = summary?.inactiveDetails ?? [];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Active groups"
        value={formatCount(summary?.activeGroups)}
        icon={<CircleCheck />}
        tone="success"
        loading={loading}
        footer={
          <Typography variant="xs" as="span" className="text-ink-4">
            Live listings with a verified invite link
          </Typography>
        }
      />
      <StatCard
        label="Inactive groups"
        value={formatCount(summary?.inactiveGroups)}
        icon={<CircleAlert />}
        tone="warning"
        loading={loading}
        footer={<InactiveGroupsFooter groups={inactiveDetails} />}
      />
      <StatCard
        label="Page views"
        value={formatCount(summary?.totalPageViews)}
        icon={<Eye />}
        tone="info"
        loading={loading}
        footer={
          <Typography variant="xs" as="span" className="text-ink-4">
            Across the {periodLabel}
          </Typography>
        }
      />
      <StatCard
        label="Join clicks"
        value={formatCount(summary?.totalJoinClicks)}
        icon={<MousePointerClick />}
        tone="success"
        loading={loading}
        footer={
          <Typography variant="xs" as="span" className="text-ink-4">
            Across the {periodLabel}
          </Typography>
        }
      />
    </div>
  );
}
