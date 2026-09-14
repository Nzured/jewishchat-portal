"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Typography } from "@/components/ui/Typography";
import { formatDate } from "@/lib/date";
import { DashboardService } from "@/services/dashboard/dashboard.service";
import {
  DashboardOverview,
  GrowthTrends,
  LiveGroupsByCategory as CategoryOption,
} from "@/types/Dashboard";
import {
  DEFAULT_PERIOD,
  overviewRequestKey,
  PERIOD_HINT_LABEL,
  PERIOD_TO_API,
  type PeriodSelection,
} from "./dashboardPeriod";
import { GrowthSnapshot } from "./GrowthSnapshot";
import { InsightsHeader } from "./InsightsHeader";
import { ALL_CATEGORIES, ListingGrowth } from "./ListingGrowth";
import { LiveGroupsByCategory } from "./LiveGroupsByCategory";
import { ModerationOperations } from "./ModerationOperations";
import { PlatformTraffic } from "./PlatformTraffic";
import { UserReports } from "./UserReports";

const MODERATION_REFRESH_MS = 5 * 60 * 1000;

interface DashboardClientProps {
  initialOverview: DashboardOverview | null;
}

export function DashboardClient({ initialOverview }: DashboardClientProps) {
  const [selection, setSelection] = useState<PeriodSelection>({ period: DEFAULT_PERIOD });
  const [categorySlug, setCategorySlug] = useState(ALL_CATEGORIES);
  const [categories, setCategories] = useState<CategoryOption[]>(
    () => initialOverview?.growthSnapshot?.liveGroupsByCategory ?? [],
  );
  const [overview, setOverview] = useState<DashboardOverview | null>(initialOverview);
  const [categoryTrends, setCategoryTrends] = useState<{
    slug: string;
    trends: GrowthTrends | null;
  } | null>(null);
  const [loading, setLoading] = useState(!initialOverview);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const lastRequestKey = useRef<string | null>(null);
  const hydratedKey = useRef<string | null>(
    initialOverview ? overviewRequestKey({ period: PERIOD_TO_API[DEFAULT_PERIOD] }) : null,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") setRefreshTick((tick) => tick + 1);
    }, MODERATION_REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const periodParams = useMemo(() => {
    if (selection.period === "custom" && (!selection.startDate || !selection.endDate)) return null;
    return {
      period: PERIOD_TO_API[selection.period],
      startDate: selection.startDate,
      endDate: selection.endDate,
    };
  }, [selection]);

  useEffect(() => {
    if (!periodParams) return;

    let ignore = false;
    const requestKey = overviewRequestKey(periodParams);
    const silent = lastRequestKey.current === requestKey;
    lastRequestKey.current = requestKey;

    if (hydratedKey.current === requestKey) {
      hydratedKey.current = null;
      return;
    }

    async function loadOverview() {
      if (!silent) setLoading(true);
      try {
        const res = await DashboardService.getOverview(periodParams ?? undefined);
        if (ignore || !res) return;
        setOverview(res.data);
        setCategories(res.data.growthSnapshot?.liveGroupsByCategory ?? []);
      } catch {
        if (ignore) return;
        setOverview(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadOverview();

    return () => {
      ignore = true;
    };
  }, [periodParams, refreshTick]);

  useEffect(() => {
    if (!periodParams || categorySlug === ALL_CATEGORIES) return;

    let ignore = false;
    const slug = categorySlug;

    async function loadCategoryTrends() {
      setTrendsLoading(true);
      try {
        const res = await DashboardService.getOverview({ ...periodParams, categorySlug: slug });
        if (ignore || !res) return;
        setCategoryTrends({ slug, trends: res.data.growthTrends ?? null });
      } catch {
        if (ignore) return;
        setCategoryTrends({ slug, trends: null });
      } finally {
        if (!ignore) setTrendsLoading(false);
      }
    }

    void loadCategoryTrends();

    return () => {
      ignore = true;
    };
  }, [periodParams, categorySlug]);

  const periodLabel = PERIOD_HINT_LABEL[selection.period];
  const listingTrends =
    categorySlug === ALL_CATEGORIES
      ? overview?.growthTrends
      : categoryTrends?.slug === categorySlug
        ? (categoryTrends.trends ?? undefined)
        : undefined;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <InsightsHeader
        title="Dashboard"
        subtitle="Moderation workload and directory health, in one place."
        selection={selection}
        onSelectionChange={setSelection}
      />

      <ModerationOperations
        data={overview?.moderationOperations}
        dataAsOf={overview?.moderationDataAsOf}
        loading={loading}
      />

      <GrowthSnapshot
        data={overview?.growthSnapshot}
        publishedInPeriod={overview?.growthTrends?.listingsPublished}
        periodLabel={periodLabel}
        loading={loading}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <ListingGrowth
          data={listingTrends}
          periodLabel={periodLabel}
          categories={categories}
          categorySlug={categorySlug}
          onCategoryChange={setCategorySlug}
          loading={loading || trendsLoading}
        />
        <LiveGroupsByCategory data={overview?.growthSnapshot} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <UserReports data={overview?.reports} periodLabel={periodLabel} loading={loading} />
        <PlatformTraffic data={overview?.traffic} periodLabel={periodLabel} loading={loading} />
      </div>

      {overview?.analyticsDataAsOf && (
        <Typography variant="xs" as="p" className="text-ink-4">
          Analytics sections refresh every 24 hours · Data as of{" "}
          {formatDate(overview.analyticsDataAsOf, "D MMM YYYY, HH:mm")} UTC
        </Typography>
      )}
    </div>
  );
}
