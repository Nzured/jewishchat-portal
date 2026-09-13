import { GROUP_SERVICE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import { DashboardOverview, DashboardOverviewParams } from "@/types/Dashboard";
import {
  ExportSearchInsightsParams,
  SearchInsightsPage,
  SearchInsightsParams,
  ZeroResultsPage,
  ZeroResultsParams,
} from "@/types/SearchInsights";
import api from "../axiosConfig";

const DASHBOARD = `${GROUP_SERVICE}admin/dashboard`;

export const DashboardService = {
  getOverview: (params: DashboardOverviewParams = {}) =>
    api.get<ApiResponse<DashboardOverview>>(`${DASHBOARD}/overview`, { params }),
  getSearchInsights: (params: SearchInsightsParams = {}) =>
    api.get<ApiResponse<SearchInsightsPage>>(`${DASHBOARD}/search-insights`, { params }),
  getZeroResultQueries: (params: ZeroResultsParams = {}) =>
    api.get<ApiResponse<ZeroResultsPage>>(`${DASHBOARD}/search-insights/zero-results`, { params }),
  exportSearchInsights: (params: ExportSearchInsightsParams = {}) =>
    api.get<Blob>(`${DASHBOARD}/search-insights/export`, { params, responseType: "blob" }),
};
