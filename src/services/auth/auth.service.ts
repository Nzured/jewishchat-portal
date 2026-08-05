import { REFRESH_TOKEN_ENDPOINT } from "@/configs/const";
import { api } from "@/services/axiosConfig";
import { ApiResponse } from "@/types/Common";
import { InviteInternalUserPayload, User } from "@/types/User";
import type {
  InvitedUser,
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ResetPasswordPayload,
  SignupRequest,
  SignupResponse,
  UserTypeResponse,
  VerifyEmailResponse,
  VerifyOtpPayload,
} from "./auth.types";

const AUTH_SERVICE = "/auth-service/api/v1/auth";
const AUTH_ADMIN_SERVICE = "/auth-service/api/v1/admin/auth";

export const AuthService = {
  signup: async (payload: SignupRequest) =>
    api.post<ApiResponse<SignupResponse>>(`${AUTH_SERVICE}/register`, payload, {
      globalLoader: true,
      skipAuthRefresh: true,
    }),
  verifyEmail: async (payload: VerifyOtpPayload) =>
    api.post<VerifyEmailResponse>(`${AUTH_SERVICE}/verify-email`, payload, {
      skipAuthRefresh: true,
    }),
  adminLogin: async (payload: LoginPayload) =>
    api.post<LoginResponse>(`${AUTH_ADMIN_SERVICE}/login`, payload, {
      globalLoader: true,
      skipAuthRefresh: true,
    }),
  refreshToken: async (payload: RefreshTokenPayload) =>
    api.post<RefreshTokenResponse>(REFRESH_TOKEN_ENDPOINT, undefined, {
      headers: { Authorization: payload.refreshToken },
      skipAuthRefresh: true,
    }),
  getUserType: async (payload: { email: string }) =>
    api.get<UserTypeResponse>(`${AUTH_SERVICE}/user-type`, {
      params: { email: payload.email },
      skipAuthRefresh: true,
    }),
  externalLogin: async (payload: LoginPayload) =>
    api.post<LoginResponse>(`${AUTH_SERVICE}/login`, payload, {
      globalLoader: true,
      skipAuthRefresh: true,
    }),
  resendOtp: async (payload: { email: string }) =>
    api.post<ApiResponse<void>>(`${AUTH_SERVICE}/resend-otp`, payload, {
      skipAuthRefresh: true,
    }),
  logout: async () =>
    api.post<ApiResponse<void>>(`${AUTH_SERVICE}/logout`, undefined, { globalLoader: true }),
  forgotPassword: async (payload: { email: string }) =>
    api.post<ApiResponse<void>>(`${AUTH_SERVICE}/forgot-password`, payload, {
      globalLoader: true,
      skipAuthRefresh: true,
    }),
  resetPassword: async (payload: ResetPasswordPayload) =>
    api.post<ApiResponse<void>>(`${AUTH_SERVICE}/reset-password`, payload, {
      globalLoader: true,
      skipAuthRefresh: true,
    }),
  inviteInternalUser: (payload: InviteInternalUserPayload) =>
    api.post<ApiResponse<User>>(`${AUTH_ADMIN_SERVICE}/invite`, payload, {
      globalLoader: true,
    }),
  validateToken: (token: string) =>
    api.get<ApiResponse<InvitedUser>>(`${AUTH_ADMIN_SERVICE}/invite/validate`, {
      params: { token },
      skipAuthRefresh: true,
    }),
  acceptAccount: (payload: { token: string; newPassword: string; confirmPassword: string }) =>
    api.post<LoginResponse>(`${AUTH_ADMIN_SERVICE}/invite/accept`, payload, {
      globalLoader: true,
      skipAuthRefresh: true,
    }),
};
