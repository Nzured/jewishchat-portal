import { ApiResponse } from "@/types/Common";
import { User, UserType } from "@/types/User";

export interface SignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  password: string;
}

export interface SignupResponse {
  id: string;
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface RefreshTokenPayload {
  refreshToken: string;
}

// Refresh returns the same shape as login (rotated accessToken + refreshToken).
export type RefreshTokenResponse = LoginResponse;

// Verifying the OTP logs the user in, so the response carries fresh tokens too.
export type VerifyEmailResponse = LoginResponse;

export interface UserTypeData {
  email: string;
  userType: UserType;
}

export type UserTypeResponse = ApiResponse<UserTypeData>;
