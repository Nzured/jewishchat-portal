"use client";

import * as React from "react";
import { GroupService } from "@/services/group/group.service";
import { ReportDetailResponse } from "@/types/Report";

interface ReportContextType {
  fetchReport: (reportId: string) => Promise<ReportDetailResponse | undefined>;
}

const ReportContext = React.createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const fetchReport = React.useCallback(async (reportId: string) => {
    const res = await GroupService.getReport(reportId);
    return res?.data;
  }, []);

  return <ReportContext.Provider value={{ fetchReport }}>{children}</ReportContext.Provider>;
}

export function useReportContext() {
  const context = React.useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReportContext must be used within a ReportProvider");
  }
  return context;
}
