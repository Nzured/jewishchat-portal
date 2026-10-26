import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthSession, getAccessToken } from "@/lib/auth";
import { stubAuthApi } from "@/test/fakeAuthApi";
import { UserType } from "@/types/User";
import { AuthProvider, useAuth } from "./AuthContext";

const auth = vi.hoisted(() => ({
  getUserType: vi.fn(),
  adminLogin: vi.fn(),
  externalLogin: vi.fn(),
  verifyEmail: vi.fn(),
  acceptAccount: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn(),
  resendOtp: vi.fn(),
}));
const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
const userCtx = vi.hoisted(() => ({ refetchUser: vi.fn(), clearUser: vi.fn() }));

vi.mock("@/services/auth/auth.service", () => ({ AuthService: auth }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/contexts/UserContext", () => ({ useUser: () => userCtx }));

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function loginData(userType: UserType) {
  return { data: { accessToken: "a", refreshToken: "r", user: { userType } } };
}

describe("AuthContext", () => {
  beforeEach(async () => {
    stubAuthApi();
    Object.values(auth).forEach((fn) => fn.mockReset());
    router.push.mockReset();
    router.refresh.mockReset();
    userCtx.refetchUser.mockReset().mockResolvedValue(undefined);
    userCtx.clearUser.mockReset();
    localStorage.clear();
    await clearAuthSession();
  });

  it("logs external users in through the external endpoint", async () => {
    auth.getUserType.mockResolvedValue({ data: { userType: UserType.EXTERNAL } });
    auth.externalLogin.mockResolvedValue(loginData(UserType.EXTERNAL));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login({ email: "a@b.co", password: "x" }));

    expect(auth.adminLogin).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe("a");
    expect(userCtx.refetchUser).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("logs internal users in through the admin endpoint", async () => {
    auth.getUserType.mockResolvedValue({ data: { userType: UserType.INTERNAL } });
    auth.adminLogin.mockResolvedValue(loginData(UserType.INTERNAL));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login({ email: "a@b.co", password: "x" }));

    expect(auth.externalLogin).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/internal");
  });

  it("rejects an unknown email without trying to log in", async () => {
    auth.getUserType.mockRejectedValue(new Error("404"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(result.current.login({ email: "x@y.co", password: "x" })).rejects.toThrow(
      /No account/,
    );
    expect(auth.externalLogin).not.toHaveBeenCalled();
  });

  it("caches the user type per email but not failures", async () => {
    auth.getUserType
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValue({ data: { userType: UserType.EXTERNAL } });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(result.current.resolveUserType("a@b.co")).resolves.toBeNull();
    await expect(result.current.resolveUserType("a@b.co")).resolves.toBe(UserType.EXTERNAL);
    await expect(result.current.resolveUserType("a@b.co")).resolves.toBe(UserType.EXTERNAL);
    expect(auth.getUserType).toHaveBeenCalledTimes(2);
  });

  it("does not store a session when the login response is incomplete", async () => {
    auth.getUserType.mockResolvedValue({ data: { userType: UserType.EXTERNAL } });
    auth.externalLogin.mockResolvedValue({ data: { accessToken: "a" } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(result.current.login({ email: "a@b.co", password: "x" })).rejects.toThrow(
      "Login failed",
    );
    expect(getAccessToken()).toBeNull();
  });

  it("returns the user type after verifying the email", async () => {
    auth.verifyEmail.mockResolvedValue(loginData(UserType.EXTERNAL));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      result.current.verifyEmail({ email: "a@b.co", otp: "123456" } as never),
    ).resolves.toBe(UserType.EXTERNAL);
    expect(getAccessToken()).toBe("a");
  });

  it("returns null when email verification fails", async () => {
    auth.verifyEmail.mockRejectedValue(new Error("bad otp"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      result.current.verifyEmail({ email: "a@b.co", otp: "000000" } as never),
    ).resolves.toBeNull();
  });

  it("still keeps the session when the profile refresh fails after login", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    auth.getUserType.mockResolvedValue({ data: { userType: UserType.EXTERNAL } });
    auth.externalLogin.mockResolvedValue(loginData(UserType.EXTERNAL));
    userCtx.refetchUser.mockRejectedValue(new Error("profile down"));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login({ email: "a@b.co", password: "x" }));
    expect(getAccessToken()).toBe("a");
  });

  it("logs out locally even when the server call fails", async () => {
    auth.logout.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    localStorage.setItem("auth", JSON.stringify({ accessToken: "a", refreshToken: "r" }));

    await act(() => result.current.logout());

    expect(getAccessToken()).toBeNull();
    expect(userCtx.clearUser).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/login");
  });
});
