"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_HOME_PATH } from "@/configs/const";
import { BrokenLinkAlert } from "./_components/BrokenLinkAlert";
import { ALL_GROUPS, PERIOD_HINT_LABEL, periodFileSuffix } from "./_components/dashboardFilters";
import { DashboardError } from "./_components/DashboardStates";
import { FiltersBar } from "./_components/FiltersBar";
import { JoinConversionReport } from "./_components/JoinConversionReport";
import { PageViewsReport } from "./_components/PageViewsReport";
import { SearchPerformanceReport } from "./_components/SearchPerformanceReport";
import { SummaryCards } from "./_components/SummaryCards";
import { useOwnerDashboard } from "./_components/useOwnerDashboard";

export default function OwnerDashboardPage() {
  const {
    filters,
    setFilters,
    sources,
    setSources,
    params,
    overview,
    groupOptions,
    overviewLoading,
    overviewError,
    retry,
  } = useOwnerDashboard();

  const periodLabel = PERIOD_HINT_LABEL[filters.period];
  const exportSuffix = periodFileSuffix(filters);
  const showGroupColumn = filters.groupUuid === ALL_GROUPS;

  return (
    <div className="flex w-full flex-col gap-6 pb-12">
      <Breadcrumbs items={[{ label: "Home", href: EXTERNAL_HOME_PATH }, { label: "Dashboard" }]} />

      <div className="flex flex-col gap-1">
        <Typography variant="h1" className="font-display font-bold text-ink-1">
          Dashboard
        </Typography>
        <Typography variant="p" className="text-ink-3">
          See how your groups perform: who views them, where visitors come from, and what they
          search for.
        </Typography>
      </div>

      <FiltersBar
        value={filters}
        groups={groupOptions}
        onChange={setFilters}
        className="sticky top-16 z-20 -mx-4 bg-surface-bg/90 px-4 py-3 backdrop-blur-md md:mx-0 md:rounded-xl md:px-0 md:backdrop-blur-none"
      />

      {overviewError && !overview ? (
        <DashboardError onRetry={retry} />
      ) : (
        <>
          <SummaryCards
            summary={overview?.summary}
            periodLabel={periodLabel}
            loading={overviewLoading}
          />

          {!overviewLoading && <BrokenLinkAlert alert={overview?.brokenLinkAlert} />}

          <PageViewsReport
            params={params}
            pageViews={overview?.pageViews}
            sources={sources}
            onSourcesChange={setSources}
            dataAsOf={overview?.dataAsOf}
            periodLabel={periodLabel}
            exportSuffix={exportSuffix}
            loading={overviewLoading}
          />

          <JoinConversionReport
            metrics={overview?.joinClicks}
            dataAsOf={overview?.dataAsOf}
            periodLabel={periodLabel}
            loading={overviewLoading}
          />

          <SearchPerformanceReport
            params={params}
            showGroup={showGroupColumn}
            periodLabel={periodLabel}
            exportSuffix={exportSuffix}
            dataAsOf={overview?.dataAsOf}
          />
        </>
      )}
    </div>
  );
}
