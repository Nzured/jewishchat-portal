import { GROUP_SERVICE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import {
  OwnerDashboardOverview,
  OwnerOverviewParams,
  SearchPerformancePage,
  SearchPerformanceParams,
  SearchPerformanceSortParams,
} from "@/types/OwnerDashboard";
import api from "../axiosConfig";

const OWNER_DASHBOARD = `${GROUP_SERVICE}dashboard/owner`;

const ARRAY_PARAMS = { paramsSerializer: { indexes: null } };

export const OwnerDashboardService = {
  getOverview: (params: OwnerOverviewParams) =>
    api.get<ApiResponse<OwnerDashboardOverview>>(OWNER_DASHBOARD, { params, ...ARRAY_PARAMS }),
  getSearchPerformance: (params: SearchPerformanceParams) =>
    api.get<ApiResponse<SearchPerformancePage>>(`${OWNER_DASHBOARD}/search-performance`, {
      params,
    }),
  exportPageViews: (params: OwnerOverviewParams) =>
    api.get<Blob>(`${OWNER_DASHBOARD}/export/page-views`, {
      params,
      responseType: "blob",
      ...ARRAY_PARAMS,
    }),
  exportSearchPerformance: (params: SearchPerformanceSortParams) =>
    api.get<Blob>(`${OWNER_DASHBOARD}/export/search-performance`, {
      params,
      responseType: "blob",
    }),
};
