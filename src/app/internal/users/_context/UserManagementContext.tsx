"use client";

import * as React from "react";
import { AuthService } from "@/services/auth/auth.service";
import { AdminUserSearchParams, UserService } from "@/services/user/user.service";
import { Group } from "@/types/Group";
import { AdminUsersPage, InviteInternalUserPayload, User } from "@/types/User";

interface UserManagementContextType {
  fetchUsers: (params: AdminUserSearchParams) => Promise<AdminUsersPage | undefined>;
  fetchUserDetails: (userId: string) => Promise<User | undefined>;
  fetchGroupsByUser: (userId: string) => Promise<Group[] | undefined>;
  inviteInternalUser: (payload: InviteInternalUserPayload) => Promise<User | undefined>;
  deleteUser: (userId: string) => Promise<void>;
  suspendUser: (
    userId: string,
    payload: { suspendTypeId: number; reason: string },
  ) => Promise<User | undefined>;
  reactivateUser: (userId: string) => Promise<User | undefined>;
  changeEmail: (userId: string, email: string) => Promise<User | undefined>;
  changeMobile: (userId: string, mobile: string) => Promise<User | undefined>;
  changeUserRole: (userId: string, roles: number[]) => Promise<User | undefined>;
  lastListedUserIds: string[];
  setLastListedUserIds: (ids: string[]) => void;
}

const UserContext = React.createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: React.ReactNode }) {
  const [lastListedUserIds, setLastListedUserIds] = React.useState<string[]>([]);

  const fetchUsers = React.useCallback(async (params: AdminUserSearchParams) => {
    const res = await UserService.fetchUsers(params);
    return res?.data;
  }, []);

  const fetchUserDetails = React.useCallback(async (userId: string) => {
    if (userId === undefined || userId === null || userId === "") return;
    const res = await UserService.getUser(userId);
    if (!res || !res.data) throw new Error("No data received");
    return res.data;
  }, []);

  const fetchGroupsByUser = React.useCallback(async (userId: string) => {
    if (userId === undefined || userId === null || userId === "") return;
    const res = await UserService.getGroupsByUser(userId);
    if (!res || !res.data) throw new Error("No data received");
    return res.data;
  }, []);

  const inviteInternalUser = React.useCallback(async (payload: InviteInternalUserPayload) => {
    const res = await AuthService.inviteInternalUser(payload);
    return res?.data;
  }, []);

  const deleteUser = React.useCallback(async (userId: string) => {
    await UserService.deleteUser(userId);
  }, []);

  const suspendUser = React.useCallback(
    async (userId: string, payload: { suspendTypeId: number; reason: string }) => {
      const res = await UserService.suspendUser(userId, payload);
      return res?.data;
    },
    [],
  );

  const reactivateUser = React.useCallback(async (userId: string) => {
    const res = await UserService.reactivateUser(userId);
    return res?.data;
  }, []);

  const changeEmail = React.useCallback(async (userId: string, email: string) => {
    const res = await UserService.changeEmail(userId, email);
    return res?.data;
  }, []);

  const changeMobile = React.useCallback(async (userId: string, mobile: string) => {
    const res = await UserService.changeMobile(userId, mobile);
    return res?.data;
  }, []);

  const changeUserRole = React.useCallback(async (userId: string, roles: number[]) => {
    const res = await UserService.changeUserRole(userId, roles);
    return res?.data;
  }, []);

  return (
    <UserContext.Provider
      value={{
        fetchUsers,
        fetchUserDetails,
        fetchGroupsByUser,
        inviteInternalUser,
        deleteUser,
        suspendUser,
        reactivateUser,
        changeEmail,
        changeMobile,
        changeUserRole,
        lastListedUserIds,
        setLastListedUserIds,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserManagementContext() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserManagementContext must be used within a UserManagementProvider");
  }
  return context;
}
