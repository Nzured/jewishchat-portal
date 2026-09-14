import { ApiResponse } from "@/types/Common";
import { Group } from "@/types/Group";
import { User } from "@/types/User";
import { serverAuthGet } from "../serverAuthFetch";
import { serverGet } from "../serverFetch";

const USER_SERVICE = "/user-service/api/v1";

export const USERS_CACHE_TAG = "users";
export const USERS_REVALIDATE_SECONDS = 300;

type ApiUser = User & { profilePictureUrl?: string | null };

const normalizeUser = (user: ApiUser): User => ({
  ...user,
  profilePic: user.profilePic ?? user.profilePictureUrl ?? undefined,
});

export const UserServer = {
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const res = await serverGet<ApiResponse<ApiUser>>(
        `${USER_SERVICE}/users/getById/${encodeURIComponent(userId)}`,
        { revalidate: USERS_REVALIDATE_SECONDS, tags: [USERS_CACHE_TAG] },
      );
      return res.data ? normalizeUser(res.data) : null;
    } catch {
      return null;
    }
  },
  getAdminUser: async (userId: string): Promise<User | null> => {
    const res = await serverAuthGet<ApiResponse<ApiUser>>(
      `${USER_SERVICE}/admin/users/${encodeURIComponent(userId)}`,
    );
    return res?.data ? normalizeUser(res.data) : null;
  },
  getAdminUserGroups: async (userId: string): Promise<Group[] | null> => {
    const res = await serverAuthGet<ApiResponse<Group[]>>(
      `${USER_SERVICE}/admin/users/${encodeURIComponent(userId)}/groups`,
    );
    return res?.data ?? null;
  },
};
