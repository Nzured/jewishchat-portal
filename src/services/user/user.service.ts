import axios from "axios";
import { GROUP_PHOTO_UPLOAD_CONTENT_TYPE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import { GetPhotoUrlResponse, GroupsPage } from "@/types/Group";
import { AdminUsersPage, User, UserReportTypes, UserType } from "@/types/User";
import { api } from "../axiosConfig";

const USER_SERVICE = "/user-service/api/v1";

export interface UpdateMyProfilePayload {
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface AdminUserSearchParams {
  search?: string;
  userType?: UserType;
  page?: number;
  size?: number;
  sort?: string;
}

type ApiUser = User & { profilePictureUrl?: string | null };

const normalizeUser = (user: ApiUser): User => ({
  ...user,
  profilePic: user.profilePic ?? user.profilePictureUrl ?? undefined,
});

const withUser = async (request: Promise<ApiResponse<ApiUser>>): Promise<ApiResponse<User>> => {
  const res = await request;
  return res?.data ? { ...res, data: normalizeUser(res.data) } : res;
};

const withUsersPage = async (
  request: Promise<ApiResponse<AdminUsersPage>>,
): Promise<ApiResponse<AdminUsersPage>> => {
  const res = await request;
  return res?.data?.users
    ? { ...res, data: { ...res.data, users: res.data.users.map(normalizeUser) } }
    : res;
};

export const UserService = {
  myProfile: () => withUser(api.get<ApiResponse<User>>(`${USER_SERVICE}/users/me`)),
  updateMyProfile: (payload: UpdateMyProfilePayload) =>
    withUser(
      api.patch<ApiResponse<User>>(`${USER_SERVICE}/users/me`, payload, { globalLoader: true }),
    ),
  fetchUsers: (params: AdminUserSearchParams) =>
    withUsersPage(api.get<ApiResponse<AdminUsersPage>>(`${USER_SERVICE}/admin/users`, { params })),
  getUser: (userId: string) =>
    withUser(api.get<ApiResponse<User>>(`${USER_SERVICE}/admin/users/${userId}`)),
  getGroupsByUser: (userId: string) =>
    api.get<ApiResponse<GroupsPage>>(`${USER_SERVICE}/admin/users/${userId}/groups`),
  deleteUser: (userId: string) =>
    api.delete<ApiResponse<void>>(`${USER_SERVICE}/admin/users/${userId}`, {
      globalLoader: true,
    }),
  getSuspendType: () =>
    api.get<ApiResponse<UserReportTypes[]>>(`${USER_SERVICE}/admin/users/suspend-types`),
  suspendUser: (userId: string, payload: { suspendTypeId: number; reason: string }) =>
    withUser(
      api.patch<ApiResponse<User>>(`${USER_SERVICE}/admin/users/${userId}/suspend`, payload, {
        globalLoader: true,
      }),
    ),
  reactivateUser: (userId: string) =>
    withUser(
      api.patch<ApiResponse<User>>(`${USER_SERVICE}/admin/users/${userId}/reactivate`, undefined, {
        globalLoader: true,
      }),
    ),
  changeEmail: (userId: string, email: string) =>
    withUser(
      api.patch<ApiResponse<User>>(
        `${USER_SERVICE}/admin/users/${userId}/email`,
        { newEmail: email },
        { globalLoader: true },
      ),
    ),
  changeMobile: (userId: string, mobile: string) =>
    withUser(
      api.patch<ApiResponse<User>>(
        `${USER_SERVICE}/admin/users/${userId}/mobile`,
        { newMobile: mobile },
        { globalLoader: true },
      ),
    ),
  changeUserRole: (userId: string, roles: number[]) =>
    withUser(
      api.post<ApiResponse<User>>(
        `${USER_SERVICE}/admin/users/${userId}/roles`,
        { roleIds: roles },
        { globalLoader: true },
      ),
    ),
  getUserById: (userId: string) =>
    withUser(api.get<ApiResponse<User>>(`${USER_SERVICE}/users/getById/${userId}`)),
  getProfilePictureUploadUrl: () =>
    api.post<ApiResponse<GetPhotoUrlResponse>>(
      `${USER_SERVICE}/users/me/profile-picture`,
      {},
      { silentSuccess: true },
    ),
  uploadProfilePicture: (uploadUrl: string, file: File) =>
    axios.put(uploadUrl, file, {
      headers: { "Content-Type": GROUP_PHOTO_UPLOAD_CONTENT_TYPE },
    }),
  requestWhatsappVerification: () =>
    api.post<ApiResponse<void>>(`${USER_SERVICE}/users/verify-whatsapp/request`, {}),
  confirmWhatsappVerification: (otp: string) =>
    withUser(api.post<ApiResponse<User>>(`${USER_SERVICE}/users/verify-whatsapp/confirm`, { otp })),
  confirmProfilePicture: (fileKey: string) =>
    withUser(
      api.patch<ApiResponse<User>>(`${USER_SERVICE}/users/me/profile-picture/confirm`, undefined, {
        params: { fileKey },
      }),
    ),
};
