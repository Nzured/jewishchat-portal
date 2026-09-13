"use client";

import { useCallback, useEffect, useState } from "react";
import { Typography } from "@/components/ui/Typography";
import { formatDate } from "@/lib/date";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import type {
  SearchInsightsPage as SearchInsightsData,
  ZeroResultsPage,
} from "@/types/SearchInsights";
import { InsightsHeader } from "../_components/InsightsHeader";
import { PERIOD_TO_API, type PeriodSelection } from "../_components/PeriodToggle";
import { AllQueriesTable } from "./_components/AllQueriesTable";
import { INSIGHTS_TABS, type InsightsTab } from "./_components/InsightsToolbar";
import { ZeroResultsTable } from "./_components/ZeroResultsTable";

export default function SearchInsightsPage() {
  const [selection, setSelection] = useState<PeriodSelection>({ period: "7d" });
  const [tab, setTab] = useState<InsightsTab>(INSIGHTS_TABS.all);
  const [zeroResultCount, setZeroResultCount] = useState<number | undefined>(undefined);
  const [countFromMainResponse, setCountFromMainResponse] = useState(false);
  const [dataAsOf, setDataAsOf] = useState<string | null>(null);

  const handleAllLoaded = useCallback((data: SearchInsightsData) => {
    if (data.dataAsOf) setDataAsOf(data.dataAsOf);
    if (data.zeroResultQueries != null) {
      setZeroResultCount(data.zeroResultQueries);
      setCountFromMainResponse(true);
    }
  }, []);

  const handleZeroLoaded = useCallback((data: ZeroResultsPage) => {
    if (data.dataAsOf) setDataAsOf(data.dataAsOf);
    if (data.totalQueries != null) setZeroResultCount(data.totalQueries);
  }, []);

  useEffect(() => {
    if (countFromMainResponse) return;
    if (selection.period === "custom" && (!selection.startDate || !selection.endDate)) return;

    let ignore = false;

    async function loadZeroResultCount() {
      try {
        const res = await DashboardService.getZeroResultQueries({
          period: PERIOD_TO_API[selection.period],
          startDate: selection.startDate,
          endDate: selection.endDate,
          page: 0,
          size: 1,
        });
        if (ignore || !res) return;
        setZeroResultCount(res.data.totalQueries ?? 0);
      } catch {
        if (!ignore) setZeroResultCount(undefined);
      }
    }

    void loadZeroResultCount();

    return () => {
      ignore = true;
    };
  }, [selection, countFromMainResponse]);

  const tabProps = { tab, onTabChange: setTab, zeroResultCount };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <InsightsHeader
        title="Search Insights"
        subtitle="What people are looking for, and what the directory is missing."
        selection={selection}
        onSelectionChange={setSelection}
      />
      {tab === INSIGHTS_TABS.zero ? (
        <ZeroResultsTable {...tabProps} selection={selection} onLoaded={handleZeroLoaded} />
      ) : (
        <AllQueriesTable {...tabProps} selection={selection} onLoaded={handleAllLoaded} />
      )}
      {dataAsOf && (
        <Typography variant="xs" as="p" className="text-ink-4">
          Search data refreshes every 24 hours · Data as of{" "}
          {formatDate(dataAsOf, "D MMM YYYY, HH:mm")} UTC
        </Typography>
      )}
    </div>
  );
}
