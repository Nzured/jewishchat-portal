"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { clearAuthSession, getHomePathForUserType, setAuthSession } from "@/lib/auth";
import { AuthService } from "@/services/auth/auth.service";
import {
  LoginData,
  LoginPayload,
  SignupRequest,
  VerifyOtpPayload,
} from "@/services/auth/auth.types";
import { UserType } from "@/types/User";

interface AuthContextType {
  resolveUserType: (email: string) => Promise<UserType | null>;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<void>;
  verifyEmail: (payload: VerifyOtpPayload) => Promise<UserType | null>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { refetchUser, clearUser } = useUser();
  const userTypeCacheRef = React.useRef<{ email: string; userType: UserType } | null>(null);

  const resolveUserType = React.useCallback(async (email: string): Promise<UserType | null> => {
    if (userTypeCacheRef.current?.email === email) return userTypeCacheRef.current.userType;

    const res = await AuthService.getUserType({ email }).catch(() => null);
    const userType = res?.data?.userType ?? null;
    if (!userType) return null;

    userTypeCacheRef.current = { email, userType };
    return userType;
  }, []);

  const establishSession = React.useCallback(
    async (data: LoginData) => {
      setAuthSession(data.accessToken, data.refreshToken, data.user.userType);

      try {
        await refetchUser();
      } catch (profileError) {
        console.error(profileError);
      }
    },
    [refetchUser],
  );

  const login = React.useCallback(
    async (payload: LoginPayload) => {
      const userType = await resolveUserType(payload.email);
      if (!userType) throw new Error("No account found with this email.");

      const loginFn =
        userType === UserType.INTERNAL ? AuthService.adminLogin : AuthService.externalLogin;
      const res = await loginFn(payload);

      if (!res?.data?.accessToken || !res?.data?.refreshToken || !res?.data?.user?.userType)
        throw new Error("Login failed");

      await establishSession(res.data);
      toast.success("User has successfully logged in");
      router.push(getHomePathForUserType(res.data.user.userType));
    },
    [resolveUserType, establishSession, router],
  );

  const signup = React.useCallback(async (payload: SignupRequest) => {
    await AuthService.signup(payload);
  }, []);

  const verifyEmail = React.useCallback(
    async (payload: VerifyOtpPayload): Promise<UserType | null> => {
      const res = await AuthService.verifyEmail(payload).catch(() => null);
      if (!res?.data?.accessToken || !res?.data?.refreshToken || !res?.data?.user?.userType)
        return null;

      await establishSession(res.data);
      return res.data.user.userType;
    },
    [establishSession],
  );

  const resendOtp = React.useCallback(async (email: string) => {
    await AuthService.resendOtp({ email });
    toast.success("Verification code resent!");
  }, []);

  const logout = React.useCallback(async () => {
    await AuthService.logout().catch(() => {});
    clearAuthSession();
    clearUser();
    router.push("/login");
  }, [clearUser, router]);

  return (
    <AuthContext.Provider
      value={{ resolveUserType, login, signup, verifyEmail, resendOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
