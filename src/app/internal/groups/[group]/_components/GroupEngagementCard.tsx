"use client";

import { Eye, MousePointerClick, ScanEye, Pointer } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { Group } from "@/types/Group";
import { SectionLabel } from "./SectionLabel";

interface GroupEngagementCardProps {
  group: Group | null;
  loading?: boolean;
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-surface-line bg-surface-bg p-3 sm:p-4">
      <div className="flex min-w-0 items-center gap-2 text-brand-green">
        {icon}
        <SectionLabel className="min-w-0 truncate text-ink-3">{label}</SectionLabel>
      </div>
      <Typography variant="h3" className="font-semibold tabular-nums text-ink-1 sm:text-3xl">
        {value.toLocaleString()}
      </Typography>
    </div>
  );
}

export default function GroupEngagementCard({ group, loading }: GroupEngagementCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <SectionLabel>Engagement</SectionLabel>
        {/* The API exposes lifetime counters only, so this is deliberately not labelled "30-day". */}
        <SectionLabel className="text-ink-4">All time</SectionLabel>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {loading || !group ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))
        ) : (
          <>
            <StatTile
              icon={<Eye className="size-4 shrink-0" />}
              label="Total Views"
              value={group.totalViews}
            />
            <StatTile
              icon={<ScanEye className="size-4 shrink-0" />}
              label="Unique Views"
              value={group.uniqueViews}
            />
            <StatTile
              icon={<MousePointerClick className="size-4 shrink-0" />}
              label="Total Clicks"
              value={group.totalJoinClicks}
            />
            <StatTile
              icon={<Pointer className="size-4 shrink-0" />}
              label="Unique Clicks"
              value={group.uniqueJoinClicks}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
