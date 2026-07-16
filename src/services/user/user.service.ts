import { ApiResponse } from "@/types/Common";
import { User } from "@/types/User";
import { api } from "../axiosConfig";

const USER_SERVICE = "/user-service/api/v1";

export const UserService = {
  myProfile: () => api.get<ApiResponse<User>>(`${USER_SERVICE}/users/me`),
};
