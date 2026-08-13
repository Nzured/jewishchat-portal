"use client";

import * as React from "react";
import { AlertTriangle, History } from "lucide-react";
import { NoData } from "@/components/ui/NoData";
import { Tabs } from "@/components/ui/Tabs";
import { TabsHeader } from "@/components/ui/TabsHeader";
import { ReportDetail } from "@/types/Report";
import ReportGroupCard from "./ReportGroupCard";

interface ReportsListSectionProps {
  reports: ReportDetail[];
  onMarkReviewed: (report: ReportDetail) => void;
}

type ReportStatusTab = "pending" | "reviewed";

export default function ReportsListSection({ reports, onMarkReviewed }: ReportsListSectionProps) {
  const [activeTab, setActiveTab] = React.useState<ReportStatusTab>("pending");
  const pendingReports = reports?.filter((report) => !report.resolved);
  const reviewedReports = reports?.filter((report) => report.resolved);
  const visibleReports = activeTab === "pending" ? pendingReports : reviewedReports;

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportStatusTab)}>
      <TabsHeader
        variant="pills"
        items={[
          {
            value: "pending",
            label: "Pending",
            icon: <AlertTriangle className="size-4" />,
            count: pendingReports?.length,
          },
          {
            value: "reviewed",
            label: "Reviewed",
            icon: <History className="size-4" />,
            count: reviewedReports?.length,
          },
        ]}
      />

      <div className="mt-4 flex flex-col gap-2">
        {visibleReports?.length ? (
          visibleReports.map((report) => (
            <ReportGroupCard
              key={report.id}
              report={report}
              onMarkReviewed={() => onMarkReviewed(report)}
            />
          ))
        ) : activeTab === "pending" ? (
          <NoData
            title="No pending reports"
            description="Every report for this group has been reviewed."
          />
        ) : (
          <NoData
            title="No reviewed reports"
            description="Reports you mark as reviewed will show up here."
          />
        )}
      </div>
    </Tabs>
  );
}
