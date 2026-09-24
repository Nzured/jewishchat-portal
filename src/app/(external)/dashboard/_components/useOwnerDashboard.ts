"use client";

import * as React from "react";
import { getGroupEditPath } from "@/lib/publicPaths";
import { OwnerDashboardService } from "@/services/dashboard/ownerDashboard.service";
import { GroupService } from "@/services/group/group.service";
import {
  OwnerDashboardOverview,
  OwnerDashboardParams,
  OwnerGroupOption,
  TrafficSource,
} from "@/types/OwnerDashboard";
import {
  type DashboardFilters,
  DEFAULT_FILTERS,
  requestKey,
  toRequestParams,
} from "./dashboardFilters";
import { ALL_TRAFFIC_SOURCES, toApiSources } from "./format";

const GROUP_OPTIONS_PAGE_SIZE = 100;

export function useOwnerDashboard() {
  const [filters, setFilters] = React.useState<DashboardFilters>(DEFAULT_FILTERS);
  const [sources, setSources] = React.useState<TrafficSource[]>(ALL_TRAFFIC_SOURCES);
  const [overview, setOverview] = React.useState<OwnerDashboardOverview | null>(null);
  const [groupOptions, setGroupOptions] = React.useState<OwnerGroupOption[]>([]);
  const [overviewLoading, setOverviewLoading] = React.useState(true);
  const [overviewError, setOverviewError] = React.useState(false);
  const [retryTick, setRetryTick] = React.useState(0);

  const params = React.useMemo<OwnerDashboardParams | null>(
    () => toRequestParams(filters),
    [filters],
  );
  const key = params ? `${requestKey(params)}|${sources.join(",")}` : null;

  React.useEffect(() => {
    let ignore = false;

    async function loadGroups() {
      try {
        const res = await GroupService.getMyGroups(0, GROUP_OPTIONS_PAGE_SIZE);
        if (ignore) return;
        setGroupOptions(
          (res?.data?.groups ?? []).map((group) => ({
            uuid: group.uuid,
            name: group.name,
            editPath: getGroupEditPath(group),
          })),
        );
      } catch {
        if (!ignore) setGroupOptions([]);
      }
    }

    void loadGroups();

    return () => {
      ignore = true;
    };
  }, []);

  React.useEffect(() => {
    if (!params) return;
    let ignore = false;

    async function loadOverview() {
      setOverviewLoading(true);
      setOverviewError(false);
      try {
        const res = await OwnerDashboardService.getOverview({
          ...params!,
          sources: toApiSources(sources),
        });
        if (ignore) return;
        setOverview(res?.data ?? null);
      } catch {
        if (ignore) return;
        setOverview(null);
        setOverviewError(true);
      } finally {
        if (!ignore) setOverviewLoading(false);
      }
    }

    void loadOverview();

    return () => {
      ignore = true;
    };
  }, [key, retryTick]);

  const retry = React.useCallback(() => setRetryTick((tick) => tick + 1), []);

  return {
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
  };
}
