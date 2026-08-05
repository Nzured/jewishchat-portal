"use client";

import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Link } from "@/components/ui/Link";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { Group } from "@/types/Group";
import { SectionLabel } from "./SectionLabel";

interface GroupReportsCardProps {
  group: Group | null;
  loading?: boolean;
}

export default function GroupReportsCard({ group, loading }: GroupReportsCardProps) {
  const reportCount = group?.reportCount ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <SectionLabel>Reports{reportCount > 0 && ` · ${reportCount}`}</SectionLabel>
        {reportCount > 0 && (
          <Link href="/internal/reports" arrow>
            Review reports
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-12 w-full rounded-xl" />
        ) : reportCount === 0 ? (
          <NoData title="No reports" description="No reports have been filed against this group." />
        ) : (
          // The individual reports live behind the reports service, which has no
          // per-group endpoint yet — so this links out rather than listing them.
          <div className="flex items-center gap-3 rounded-xl border border-surface-line bg-surface-bg p-3 px-4">
            <ShieldAlert className="size-4 shrink-0 text-state-warn" />
            <Typography variant="small" className="text-ink-2">
              <span className="font-semibold tabular-nums text-ink-1">{reportCount}</span>{" "}
              {reportCount === 1 ? "report" : "reports"} filed against this group. Review them in
              the reports queue.
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
