"use client";

import * as React from "react";
import { AlertTriangle, History } from "lucide-react";
import { toast } from "sonner";
import { Tabs } from "@/components/ui/Tabs";
import { TabsHeader } from "@/components/ui/TabsHeader";
import { Report } from "@/types/Report";
import ReportGroupCard from "./ReportGroupCard";

interface ReportsListSectionProps {
  initialReports: Report[];
}

type ReportStatusTab = "pending" | "reviewed";

export default function ReportsListSection({ initialReports }: ReportsListSectionProps) {
  const [reports, setReports] = React.useState(initialReports);
  const [activeTab, setActiveTab] = React.useState<ReportStatusTab>("pending");
  const pendingReports = reports.filter((report) => !report.reviewed);
  const reviewedReports = reports.filter((report) => report.reviewed);
  const visibleReports = activeTab === "pending" ? pendingReports : reviewedReports;

  const handleMarkReviewed = (report: Report) => {
    setReports((prev) =>
      prev.map((item) => (item.id === report.id ? { ...item, reviewed: true } : item)),
    );
    toast.success(`Report from ${report.reportedBy.name} marked as reviewed.`);
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportStatusTab)}>
      <TabsHeader
        variant="pills"
        items={[
          {
            value: "pending",
            label: "Pending",
            icon: <AlertTriangle className="size-4" />,
            count: pendingReports.length,
          },
          {
            value: "reviewed",
            label: "Reviewed",
            icon: <History className="size-4" />,
            count: reviewedReports.length,
          },
        ]}
      />

      <div className="mt-4 flex flex-col gap-2">
        {visibleReports?.map((report) => (
          <ReportGroupCard
            key={report.id}
            report={report}
            onMarkReviewed={() => handleMarkReviewed(report)}
          />
        ))}
      </div>
    </Tabs>
  );
}
