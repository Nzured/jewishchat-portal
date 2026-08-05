"use client";

import * as React from "react";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from "@/configs/const";
import { GroupService } from "@/services/group/group.service";
import { Category } from "@/types/Category";
import { Group, GroupsPage, GroupStatus } from "@/types/Group";

export interface AdminGroupSearchParams {
  search?: string;
  status?: GroupStatus;
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

interface AdminGroupContextType {
  fetchGroups: (params: AdminGroupSearchParams) => Promise<GroupsPage | undefined>;
  fetchCategories: () => Promise<Category[]>;
  fetchGroupByUuid: (uuid: string) => Promise<Group | undefined>;
  fetchGroupsForReview: (page?: number, pageSize?: number) => Promise<GroupsPage | undefined>;
  approveGroup: (groupId: string) => Promise<Group | undefined>;
  rejectGroup: (groupId: string, rejectionReason: string) => Promise<Group | undefined>;
  reactivateGroup: (groupId: string) => Promise<Group | undefined>;
  resetReportCount: (groupId: string) => Promise<Group | undefined>;
  suspendGroup: (groupId: string) => Promise<Group | undefined>;
  lastListedGroupIds: string[];
  setLastListedGroupIds: (ids: string[]) => void;
}

const AdminGroupContext = React.createContext<AdminGroupContextType | undefined>(undefined);

export function AdminGroupProvider({ children }: { children: React.ReactNode }) {
  const [lastListedGroupIds, setLastListedGroupIds] = React.useState<string[]>([]);

  const fetchGroups = React.useCallback(
    async ({
      search = "",
      status,
      category = "",
      page = DEFAULT_PAGE,
      pageSize = DEFAULT_PAGE_SIZE,
      sort = DEFAULT_SORT,
    }: AdminGroupSearchParams) => {
      const res = await GroupService.getAdminGroups(search, status, category, page, pageSize, sort);
      return res?.data;
    },
    [],
  );

  const categoriesRequest = React.useRef<Promise<Category[]> | null>(null);

  const fetchCategories = React.useCallback(() => {
    categoriesRequest.current ??= GroupService.getCategories()
      .then((res) => res.data)
      .catch((error) => {
        categoriesRequest.current = null;
        throw error;
      });

    return categoriesRequest.current;
  }, []);

  const fetchGroupByUuid = React.useCallback(async (uuid: string) => {
    if (uuid === undefined || uuid === null || uuid === "") return;
    const res = await GroupService.getGroupByUuidAdmin(uuid);
    if (!res || !res.data) throw new Error("No data received");
    return res.data;
  }, []);

  const fetchGroupsForReview = React.useCallback(
    async (page: number = DEFAULT_PAGE, pageSize: number = DEFAULT_PAGE_SIZE) => {
      const res = await GroupService.groupsForAdminReview(page, pageSize);
      return res?.data;
    },
    [],
  );

  const approveGroup = React.useCallback(async (groupId: string) => {
    const res = await GroupService.approveGroup(groupId);
    return res?.data;
  }, []);

  const rejectGroup = React.useCallback(async (groupId: string, rejectionReason: string) => {
    const res = await GroupService.rejectGroup(groupId, rejectionReason);
    return res?.data;
  }, []);

  const reactivateGroup = React.useCallback(async (groupId: string) => {
    const res = await GroupService.reactivateGroup(groupId);
    return res?.data;
  }, []);

  const resetReportCount = React.useCallback(async (groupId: string) => {
    const res = await GroupService.resetReportCount(groupId);
    return res?.data;
  }, []);

  const suspendGroup = React.useCallback(async (groupId: string) => {
    const res = await GroupService.suspendGroup(groupId);
    return res?.data;
  }, []);

  return (
    <AdminGroupContext.Provider
      value={{
        fetchGroups,
        fetchCategories,
        fetchGroupByUuid,
        fetchGroupsForReview,
        approveGroup,
        rejectGroup,
        reactivateGroup,
        resetReportCount,
        suspendGroup,
        lastListedGroupIds,
        setLastListedGroupIds,
      }}
    >
      {children}
    </AdminGroupContext.Provider>
  );
}

export function useAdminGroupContext() {
  const context = React.useContext(AdminGroupContext);
  if (context === undefined) {
    throw new Error("useAdminGroupContext must be used within an AdminGroupProvider");
  }
  return context;
}
