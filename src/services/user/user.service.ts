import { ApiResponse } from "@/types/Common";
import { Group } from "@/types/Group";
import { User, UserType } from "@/types/User";
import { api } from "../axiosConfig";

const USER_SERVICE = "/user-service/api/v1";

export interface AdminUserSearchParams {
  search?: string;
  userType?: UserType;
  page?: number;
  size?: number;
  sort?: string[];
}

export const UserService = {
  myProfile: () => api.get<ApiResponse<User>>(`${USER_SERVICE}/users/me`),
  fetchAdminUsers: (params: AdminUserSearchParams) =>
    api.get<ApiResponse<User[]>>(`${USER_SERVICE}/admin/users`, { params }),
  getUser: (userId: string) => api.get<ApiResponse<User>>(`${USER_SERVICE}/admin/users/${userId}`),
  getGroupsByUser: (userId: string) =>
    api.get<ApiResponse<Group[]>>(`${USER_SERVICE}/admin/users/${userId}/groups`),
};
