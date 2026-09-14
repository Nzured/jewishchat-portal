import { GROUP_SERVICE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import { Group } from "@/types/Group";
import { serverAuthGet } from "../serverAuthFetch";

export const GroupAdminServer = {
  getGroupByUuid: async (uuid: string): Promise<Group | null> => {
    const res = await serverAuthGet<ApiResponse<Group>>(
      `${GROUP_SERVICE}admin/groups/${encodeURIComponent(uuid)}`,
    );
    return res?.data ?? null;
  },
};
