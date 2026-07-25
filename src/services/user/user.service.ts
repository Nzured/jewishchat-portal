import { ApiResponse } from "@/types/Common";
import { Group } from "@/types/Group";
import { AdminUsersPage, User, UserReportTypes, UserType } from "@/types/User";
import { api } from "../axiosConfig";

const USER_SERVICE = "/user-service/api/v1";

export interface AdminUserSearchParams {
  search?: string;
  userType?: UserType;
  page?: number;
  size?: number;
  sort?: string;
}

export const UserService = {
  myProfile: () => api.get<ApiResponse<User>>(`${USER_SERVICE}/users/me`),
  fetchUsers: (params: AdminUserSearchParams) =>
    api.get<ApiResponse<AdminUsersPage>>(`${USER_SERVICE}/admin/users`, { params }),
  getUser: (userId: string) => api.get<ApiResponse<User>>(`${USER_SERVICE}/admin/users/${userId}`),
  getGroupsByUser: (userId: string) =>
    api.get<ApiResponse<Group[]>>(`${USER_SERVICE}/admin/users/${userId}/groups`),
  deleteUser: (userId: string) =>
    api.delete<ApiResponse<void>>(`${USER_SERVICE}/admin/users/${userId}`, {
      globalLoader: true,
    }),
  getSuspendType: () =>
    api.get<ApiResponse<UserReportTypes[]>>(`${USER_SERVICE}/admin/users/suspend-types`),
  suspendUser: (userId: string, payload: { suspendTypeId: number; reason: string }) =>
    api.patch<ApiResponse<User>>(`${USER_SERVICE}/admin/users/${userId}/suspend`, payload, {
      globalLoader: true,
    }),
  reactivateUser: (userId: string) =>
    api.patch<ApiResponse<User>>(`${USER_SERVICE}/admin/users/${userId}/reactivate`, undefined, {
      globalLoader: true,
    }),
  changeEmail: (userId: string, email: string) =>
    api.patch<ApiResponse<User>>(
      `${USER_SERVICE}/admin/users/${userId}/email`,
      { newEmail: email },
      {
        globalLoader: true,
      },
    ),
  changeMobile: (userId: string, mobile: string) =>
    api.patch<ApiResponse<User>>(
      `${USER_SERVICE}/admin/users/${userId}/mobile`,
      { newMobile: mobile },
      {
        globalLoader: true,
      },
    ),
  changeUserRole: (userId: string, roles: number[]) =>
    api.patch<ApiResponse<User>>(
      `${USER_SERVICE}/admin/users/${userId}/role`,
      { roles: roles },
      {
        globalLoader: true,
      },
    ),
};
