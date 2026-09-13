"use client";

import * as React from "react";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import { SearchInsightsSortBy, SortDirection } from "@/types/SearchInsights";
import { downloadBlob } from "./InsightsToolbar";
import { type PeriodSelection, PERIOD_TO_API } from "../../_components/PeriodToggle";

interface UseExportInsightsOptions {
  selection: PeriodSelection;
  sortBy: SearchInsightsSortBy;
  sortDir: SortDirection;
  zeroResultsOnly: boolean;
}

export function useExportInsights({
  selection,
  sortBy,
  sortDir,
  zeroResultsOnly,
}: UseExportInsightsOptions) {
  const [exporting, setExporting] = React.useState(false);

  const exportCsv = React.useCallback(async () => {
    if (selection.period === "custom" && (!selection.startDate || !selection.endDate)) return;
    setExporting(true);
    try {
      const blob = await DashboardService.exportSearchInsights({
        period: PERIOD_TO_API[selection.period],
        startDate: selection.startDate,
        endDate: selection.endDate,
        zeroResultsOnly,
        sortBy,
        sortDir,
      });
      if (!blob) return;
      const prefix = zeroResultsOnly ? "zero-result-queries" : "search-queries";
      downloadBlob(`${prefix}-${PERIOD_TO_API[selection.period].toLowerCase()}.csv`, blob);
    } catch {
      return;
    } finally {
      setExporting(false);
    }
  }, [selection, sortBy, sortDir, zeroResultsOnly]);

  return { exportCsv, exporting };
}
