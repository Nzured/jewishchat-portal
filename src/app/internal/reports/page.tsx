"use client";

import { useCallback, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import AppHeader from "@/components/layout/app/AppHeader";
import { ConfigureThresholdsModal } from "./_components/ConfigureThresholdsModal";
import { ReportsTable } from "./_components/ReportTable";

export default function ReportPage() {
  const [totalReports, setTotalReports] = useState(0);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const handleCountChange = useCallback((total: number) => setTotalReports(total), []);

  return (
    <>
      <AppHeader
        title={"Report Management"}
        subtitle={"Manage reports flagged by the users. Review and suspend faulty groups."}
        count={totalReports}
        onButtonPress={() => setThresholdsOpen(true)}
        buttonLabel={"Configure Threshold"}
        buttonIcon={<SlidersHorizontal className="size-4" />}
      />
      <div className="mt-6">
        <ReportsTable onCountChange={handleCountChange} />
      </div>
      <ConfigureThresholdsModal open={thresholdsOpen} onOpenChange={setThresholdsOpen} />
    </>
  );
}
