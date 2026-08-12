"use client";

import { CheckCheck, Flag, Quote, Unlink } from "lucide-react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { REPORT_CATEGORY_LABELS, ReportCategories, ReportDetail } from "@/types/Report";

interface ReportGroupCardProps {
  report: ReportDetail;
  onMarkReviewed?: () => void;
}

const CATEGORY_TEXT_COLOR: Record<ReportCategories, string> = {
  [ReportCategories.INAPPROPRIATE_CONTENT]: "text-state-danger",
  [ReportCategories.LINK_NOT_WORKING]: "text-state-warn",
  [ReportCategories.RESUBMISSION_MESSAGE]: "text-state-info",
};

export default function ReportGroupCard({ report, onMarkReviewed }: ReportGroupCardProps) {
  const reporter = report.reporter;
  const reporterName = reporter
    ? `${reporter.firstName} ${reporter.lastName}`.trim()
    : NOT_APPLICABLE;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-surface-line">
        <NextLink
          href={`/internal/users/${report.reporterUuid}`}
          className="flex min-w-0 flex-row items-center gap-2"
        >
          <Avatar variant={"circle"} name={reporterName} />
          <Typography
            variant={"small"}
            className="truncate font-semibold text-ink-1 transition-colors hover:text-brand-green"
          >
            {reporterName}
          </Typography>
        </NextLink>
        {!report.resolved && (
          <Button
            size={"icon"}
            aria-label="Mark report as reviewed"
            onClick={onMarkReviewed}
            className="shrink-0"
          >
            <CheckCheck />
          </Button>
        )}
      </CardHeader>
      <CardDescription className="flex flex-col gap-3 px-4">
        {report.description && (
          <div className="flex min-w-0 flex-row items-start gap-2">
            <Quote size={18} className="mt-0.5 shrink-0 text-ink-4" />
            <Typography variant={"p"} className="min-w-0 text-ink-2" clampLines={3}>
              {report.description}
            </Typography>
          </div>
        )}
        <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-1">
          {report.category && (
            <div
              className={cn(
                "flex shrink-0 flex-row items-center gap-1.5",
                CATEGORY_TEXT_COLOR[report.category],
              )}
            >
              {report.category === ReportCategories.INAPPROPRIATE_CONTENT ? (
                <Flag size={14} />
              ) : (
                <Unlink size={14} />
              )}
              <Typography variant={"tiny"} className="font-medium">
                {REPORT_CATEGORY_LABELS[report.category]}
              </Typography>
            </div>
          )}
          <Typography variant={"tiny"} className="shrink-0 text-ink-4">
            {report.createdAt
              ? formatDate(report.createdAt, "D MMM YYYY · h:mm A")
              : NOT_APPLICABLE}
          </Typography>
        </div>
      </CardDescription>
    </Card>
  );
}
