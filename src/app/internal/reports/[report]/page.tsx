"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Banner } from "@/components/ui/Banner";
import { Card, CardContent } from "@/components/ui/Card";
import { NoData } from "@/components/ui/NoData";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { GroupService } from "@/services/group/group.service";
import { GroupStatus } from "@/types/Group";
import {
  REPORT_CATEGORY_LABELS,
  ReportCategories,
  ReportDetail,
  ReportDetailResponse,
} from "@/types/Report";
import ActionsCard from "./_components/ActionsCard";
import GroupDetailsCard from "./_components/GroupDetailsCard";
import GroupNavigation from "./_components/GroupNavigation";
import ReportsListSection from "./_components/ReportsListSection";
import { ReportProvider, useReportContext } from "./_context/ReportContext";

interface GroupSuspension {
  reasonLabel: string;
  remark: string;
  suspendedAt: string;
  suspendedBy: string;
}

const CATEGORY_LABELS = REPORT_CATEGORY_LABELS;

const CATEGORY_COLORS: Record<ReportCategories, string> = {
  [ReportCategories.LINK_NOT_WORKING]: "bg-state-warn",
  [ReportCategories.INAPPROPRIATE_CONTENT]: "bg-state-danger",
  [ReportCategories.RESUBMISSION_MESSAGE]: "bg-state-info",
};

export default function Report() {
  const params = useParams<{ report: string }>();
  return (
    <ReportProvider>
      <ReportPageContent key={params.report} reportId={params.report} />
    </ReportProvider>
  );
}

function ReportListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="mt-2 flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ReportPageContent({ reportId }: { reportId: string }) {
  const { fetchReport } = useReportContext();
  const { user } = useUser();
  const [data, setData] = React.useState<ReportDetailResponse>();
  const [isLoading, setIsLoading] = React.useState(Boolean(reportId));
  const [suspension, setSuspension] = React.useState<GroupSuspension | null>(null);
  const group = data?.report.group;

  const allReports = React.useMemo(() => {
    if (!data) return [];
    const others = data.allGroupReports.filter((r) => r.id !== data.report.id);
    return [data.report, ...others];
  }, [data]);
  const unreviewedReports = allReports.filter((r) => !r.resolved);
  const totalUnreviewed = unreviewedReports.length;

  const categoryCounts = unreviewedReports.reduce(
    (acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    },
    {} as Record<ReportCategories, number>,
  );

  React.useEffect(() => {
    if (!reportId) return;

    let ignore = false;

    fetchReport(reportId)
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch(() => {
        if (!ignore) setData(undefined);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reportId, fetchReport]);

  const handleSuspend = (data: { reason: string; reasonLabel: string; remark: string }) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            report: {
              ...prev.report,
              group: { ...prev.report.group, status: GroupStatus.SUSPENDED },
            },
          }
        : prev,
    );
    setSuspension({
      reasonLabel: data.reasonLabel,
      remark: data.remark,
      suspendedAt: formatDate(new Date()),
      suspendedBy: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
    });
  };

  const handleRelist = async () => {
    if (!group?.uuid) return;

    try {
      await GroupService.reactivateGroup(group.uuid);
      setData((prev) =>
        prev
          ? {
              ...prev,
              report: {
                ...prev.report,
                group: { ...prev.report.group, status: GroupStatus.ACTIVE },
              },
            }
          : prev,
      );
      setSuspension(null);
      toast.success("Group re-listed.");
    } catch {}
  };

  const handleMarkReviewed = async (report: ReportDetail) => {
    if (typeof report?.id !== "number") return;

    try {
      await GroupService.resolveReport(report.id);
      setData((prev) => {
        if (!prev) return prev;
        const markResolved = (item: ReportDetail) =>
          item.id === report.id ? { ...item, resolved: true } : item;
        return {
          ...prev,
          report: markResolved(prev.report),
          allGroupReports: prev.allGroupReports.map(markResolved),
        };
      });
      toast.success("Report marked as reviewed.");
    } catch {}
  };

  const handleResolveAll = () => {
    setData((prev) => {
      if (!prev) return prev;
      const markResolved = (item: ReportDetail) => ({ ...item, resolved: true });
      return {
        ...prev,
        report: markResolved(prev.report),
        allGroupReports: prev.allGroupReports.map(markResolved),
      };
    });
    toast.success("All reports for this group marked as reviewed.");
  };

  const summaryCard = isLoading ? (
    <Skeleton className="h-24 w-full rounded-xl" />
  ) : (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex items-center gap-3">
          <Typography variant={"h1"} className="text-state-error">
            {totalUnreviewed}
          </Typography>
          <Typography variant={"p"} className="text-ink-3 font-medium leading-snug">
            Unreviewed reports
          </Typography>
        </div>
        <Separator orientation="vertical" className="bg-surface-line mx-4 hidden md:block" />
        <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-2">
          {Object.entries(categoryCounts).map(([category, count]) => {
            const label = CATEGORY_LABELS[category as ReportCategories] || category;
            const colorClass = CATEGORY_COLORS[category as ReportCategories] || "bg-ink-3";
            return (
              <div key={category} className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", colorClass)} />
                <Typography variant={"p"} className="text-ink-2 text-xs font-medium">
                  <span className="text-ink-1 font-semibold mr-1">{count}</span>
                  {label}
                </Typography>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const reportsList = isLoading ? (
    <ReportListSkeleton />
  ) : allReports.length > 0 ? (
    <ReportsListSection
      reports={allReports}
      onMarkReviewed={(report) => void handleMarkReviewed(report)}
    />
  ) : (
    <NoData title="No reports yet" description="Reports for this group will show up here." />
  );

  return (
    <div className="flex flex-col gap-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <GroupNavigation />

      {group?.status === GroupStatus.SUSPENDED && suspension && (
        <Banner
          variant="warning"
          icon={<AlertTriangle />}
          title={`Suspended on ${suspension.suspendedAt} by ${suspension.suspendedBy}`}
          description={`Reason: ${suspension.reasonLabel}${suspension.remark ? ` ${suspension.remark}` : ""}. Hidden from the directory and search, reports remain open below for the record.`}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr] md:items-start">
        <div className="order-2 flex flex-col gap-4 md:order-1">
          {summaryCard}
          {reportsList}
        </div>
        <div className="order-1 flex flex-col gap-4 md:order-2">
          <GroupDetailsCard group={group} />
          {group && (
            <ActionsCard
              group={group}
              onSuspend={handleSuspend}
              onRelist={() => void handleRelist()}
              onResolveAll={handleResolveAll}
            />
          )}
        </div>
      </div>
    </div>
  );
}
