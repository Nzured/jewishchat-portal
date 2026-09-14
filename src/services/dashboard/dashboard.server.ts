import { GROUP_SERVICE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import { DashboardOverview, DashboardOverviewParams } from "@/types/Dashboard";
import { serverAuthGet } from "../serverAuthFetch";

const DASHBOARD = `${GROUP_SERVICE}admin/dashboard`;

export const DashboardServer = {
  getOverview: async (params: DashboardOverviewParams = {}) => {
    const res = await serverAuthGet<ApiResponse<DashboardOverview>>(`${DASHBOARD}/overview`, {
      ...params,
    });
    return res?.data ?? null;
  },
};
