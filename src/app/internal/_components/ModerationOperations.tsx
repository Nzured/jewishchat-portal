"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CircleCheck, Clock, Unlink } from "lucide-react";
import { NOT_APPLICABLE } from "@/configs/const";
import { timeAgo } from "@/lib/date";
import { ModerationOperationsStats } from "@/types/Dashboard";
import { SectionBadge, SectionHeader } from "./SectionHeader";
import { StatTile, type StatTileProps } from "./StatTile";

interface ModerationOperationsProps {
  data?: ModerationOperationsStats;
  dataAsOf?: string;
  loading?: boolean;
}

const BADGE_TICK_MS = 60 * 1000;

function oldestHint(age?: string | null) {
  return age ? `Oldest: ${age}` : undefined;
}

export function ModerationOperations({
  data,
  dataAsOf,
  loading = false,
}: ModerationOperationsProps) {
  const [, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), BADGE_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const tiles: StatTileProps[] = [
    {
      label: "Published today",
      value: data?.publishedToday ?? NOT_APPLICABLE,
      icon: <CircleCheck />,
      tone: "success",
      action: { label: "View all", href: "/internal/groups" },
    },
    {
      label: "Pending review",
      value: data?.pendingReview ?? NOT_APPLICABLE,
      icon: <Clock />,
      tone: "warning",
      hint: oldestHint(data?.oldestPendingAge),
      action: { label: "Review queue", href: "/internal/groups?status=pending" },
    },
    {
      label: "Unresolved reports",
      value: data?.unresolvedReports ?? NOT_APPLICABLE,
      icon: <AlertTriangle />,
      tone: "danger",
      hint: oldestHint(data?.oldestUnresolvedReportAge),
      action: { label: "Open reports", href: "/internal/reports" },
    },
    {
      label: "Broken links detected",
      value: data?.brokenLinksDetected ?? NOT_APPLICABLE,
      icon: <Unlink />,
      tone: "info",
      hint: "Awaiting owner fix",
      hintTone: "muted",
      action: { label: "View listings", href: "/internal/groups?health=broken" },
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Moderation operations"
        subtitle="Current state, not affected by the period filter."
        badge={
          <SectionBadge tone="success">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-state-success opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-state-success" />
            </span>
            Live
            {dataAsOf && (
              <>
                <span className="text-state-success/50">·</span>
                Updated {timeAgo(dataAsOf)}
              </>
            )}
          </SectionBadge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} loading={loading} />
        ))}
      </div>
    </section>
  );
}
