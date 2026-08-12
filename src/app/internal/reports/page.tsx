"use client";

import { useCallback, useState } from "react";
import AppHeader from "@/components/layout/app/AppHeader";
import { ReportsTable } from "./_components/ReportTable";

export default function ReportPage() {
  const [totalReports, setTotalReports] = useState(0);
  const handleCountChange = useCallback((total: number) => setTotalReports(total), []);

  return (
    <>
      <AppHeader
        title={"Report Management"}
        subtitle={"Manage reports flagged by the users. Review and suspend faulty groups."}
        count={totalReports}
      />
      <div className="mt-6">
        <ReportsTable onCountChange={handleCountChange} />
      </div>
    </>
  );
}
