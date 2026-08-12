import { Flag, Unlink } from "lucide-react";
import { StatusPill } from "@/app/internal/groups/_components/StatusPill";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_PATH, NOT_APPLICABLE } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { formatDate } from "@/lib/date";
import { AdminGroupReport, ReportCategories } from "@/types/Report";

interface ReportCardProps {
  report: AdminGroupReport;
  onView: (report: AdminGroupReport) => void;
}

export function ReportCard({ report, onView }: ReportCardProps) {
  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      onClick={() => onView(report)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView(report);
        }
      }}
      className="cursor-pointer transition-shadow hover:shadow-md active:shadow-md"
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              variant="tile"
              src={report.group?.thumbnailUrl ?? undefined}
              name={report.group?.name}
            />
            <div className="flex flex-col">
              <Typography variant="small" className="font-semibold text-ink-1">
                {report.group?.name ?? NOT_APPLICABLE}
              </Typography>
              <Typography variant="muted">
                {report.group?.slug
                  ? `${EXTERNAL_GROUPS_PATH}/${report.group.slug}`
                  : NOT_APPLICABLE}
              </Typography>
            </div>
          </div>
          {report.group?.status ? (
            <StatusPill status={report.group.status} />
          ) : (
            <Typography variant="muted">{NOT_APPLICABLE}</Typography>
          )}
        </div>

        {report.category && (
          <Chip
            shape="pill"
            type={report.category === ReportCategories.INAPPROPRIATE_CONTENT ? "error" : "warning"}
            label={wordFormatter(report.category)}
            leftIcon={
              report.category === ReportCategories.INAPPROPRIATE_CONTENT ? (
                <Flag size={14} />
              ) : (
                <Unlink size={14} />
              )
            }
            className="w-fit"
          />
        )}

        {report.description && (
          <Typography variant="muted" clampLines={2}>
            {report.description}
          </Typography>
        )}

        <div className="flex items-center justify-between">
          <Typography variant="muted">
            <span className="font-medium tabular-nums text-ink-1">
              {report.group?.memberCount?.toLocaleString() ?? NOT_APPLICABLE}
            </span>{" "}
            {report.group?.memberCount === 1 ? "member" : "members"}
          </Typography>
          <Typography variant="muted">
            {report.createdAt ? formatDate(report.createdAt) : NOT_APPLICABLE}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
