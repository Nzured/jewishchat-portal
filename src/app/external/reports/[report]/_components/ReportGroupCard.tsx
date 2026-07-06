"use client";

import { CheckCheck, Flag, Quote, Unlink } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { Report, ReportCategories } from "@/types/Report";

interface ReportGroupCardProps {
  report: Report;
  onMarkReviewed?: () => void;
}

export default function ReportGroupCard({ report, onMarkReviewed }: ReportGroupCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-surface-line">
        <div className="flex flex-row items-center gap-2">
          <Avatar
            variant={"circle"}
            src={report.reportedBy.profilePic}
            name={report.reportedBy.name}
          />
          <Typography variant={"p"} className="font-semibold">
            {report.reportedBy.name}
          </Typography>
          <Link href="#" arrow>
            View Profile
          </Link>
        </div>
        {!report.reviewed && (
          <Button size={"icon"} aria-label="Mark report as reviewed" onClick={onMarkReviewed}>
            <CheckCheck />
          </Button>
        )}
      </CardHeader>
      <CardDescription className="flex flex-row items-start gap-4 px-4">
        {report.description && (
          <div className="flex min-w-0 flex-1 flex-row items-start gap-2">
            <Quote size={20} className="mt-0.5 shrink-0 text-ink-4" />
            <div className="flex min-w-0 flex-col gap-1">
              <Typography variant={"p"} className="text-ink-2" clampLines={2}>
                {report.description}
              </Typography>
            </div>
          </div>
        )}
        <div className="ml-auto flex shrink-0 flex-col items-end gap-3 self-end">
          {report.reason && (
            <Chip
              shape="pill"
              type={report.reason === ReportCategories.INAPPROPRIATE_CONTENT ? "error" : "warning"}
              label={wordFormatter(report.reason)}
              leftIcon={
                report.reason === ReportCategories.INAPPROPRIATE_CONTENT ? (
                  <Flag size={20} />
                ) : (
                  <Unlink size={20} />
                )
              }
            />
          )}
          <Typography variant={"tiny"} className="text-ink-4">
            {report.reportedDate}
          </Typography>
        </div>
      </CardDescription>
    </Card>
  );
}
