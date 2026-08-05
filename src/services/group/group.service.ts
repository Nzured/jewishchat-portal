import axios from "axios";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  GROUP_PHOTO_UPLOAD_CONTENT_TYPE,
  GROUP_SERVICE,
} from "@/configs/const";
import { Category } from "@/types/Category";
import { ApiResponse } from "@/types/Common";
import {
  GetPhotoUrlResponse,
  Group,
  GroupDraft,
  GroupDraftRef,
  GroupDraftStep1Payload,
  GroupDraftStep2Payload,
  GroupsPage,
  GroupStatus,
} from "@/types/Group";
import api from "../axiosConfig";

export const GroupService = {
  getAllGroups: (
    search?: string,
    location?: string,
    category: string = "",
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    sort: string = "totalViews,desc",
  ) =>
    api.get<ApiResponse<GroupsPage>>(`${GROUP_SERVICE}groups`, {
      params: { search, location, category, page, pageSize, sort },
    }),
  getGroupBySlug: (slug: string) => api.get<ApiResponse<Group>>(`${GROUP_SERVICE}groups/${slug}`),
  getDraftId: () =>
    api.post<ApiResponse<GroupDraftRef>>(
      `${GROUP_SERVICE}groups/drafts`,
      {},
      { globalLoader: true },
    ),
  saveDraftStep1: (payload: GroupDraftStep1Payload, draftId: string) =>
    api.patch<ApiResponse<GroupDraft>>(`${GROUP_SERVICE}groups/drafts/${draftId}/step1`, payload, {
      globalLoader: true,
    }),
  saveDraftStep2: (payload: GroupDraftStep2Payload, draftId: string) =>
    api.patch<ApiResponse<GroupDraft>>(`${GROUP_SERVICE}groups/drafts/${draftId}/step2`, payload, {
      globalLoader: true,
    }),
  saveDraftStep4: (draftId: string) =>
    api.post<ApiResponse<GetPhotoUrlResponse>>(
      `${GROUP_SERVICE}groups/drafts/${draftId}/step4/photo`,
      {},
    ),
  uploadGroupPhoto: (uploadUrl: string, file: File, onProgress?: (percent: number) => void) =>
    axios.put(uploadUrl, file, {
      headers: { "Content-Type": GROUP_PHOTO_UPLOAD_CONTENT_TYPE },
      onUploadProgress: ({ loaded, total }) =>
        onProgress?.(total ? Math.round((loaded / total) * 100) : 0),
    }),
  getCategories: () => api.get<ApiResponse<Category[]>>(`${GROUP_SERVICE}groups/categories`),
  submitDraft: (draftId: string) =>
    api.post<ApiResponse<GroupDraft>>(
      `${GROUP_SERVICE}groups/drafts/${draftId}/submit`,
      {},
      { globalLoader: true },
    ),
  getAdminGroups: (
    search: string,
    status?: GroupStatus,
    category: string = "",
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    sort: string = DEFAULT_SORT,
  ) =>
    api.get<ApiResponse<GroupsPage>>(`${GROUP_SERVICE}admin/groups`, {
      params: { search, status, category, page, pageSize, sort },
    }),
  getGroupByUuidAdmin: (uuid: string) =>
    api.get<ApiResponse<Group>>(`${GROUP_SERVICE}admin/groups/${uuid}`),
  groupsForAdminReview: (page: number = DEFAULT_PAGE, pageSize: number = DEFAULT_PAGE_SIZE) =>
    api.get<ApiResponse<GroupsPage>>(`${GROUP_SERVICE}admin/groups/manual-review`, {
      params: { page, pageSize },
    }),
  approveGroup: (groupId: string) =>
    api.patch<ApiResponse<Group>>(
      `${GROUP_SERVICE}admin/groups/${groupId}/moderation/approve`,
      {},
      { globalLoader: true },
    ),
  rejectGroup: (groupId: string, rejectionReason: string) =>
    api.patch<ApiResponse<Group>>(
      `${GROUP_SERVICE}admin/groups/${groupId}/moderation/reject`,
      { reason: rejectionReason },
      { globalLoader: true },
    ),
  reactivateGroup: (groupId: string) =>
    api.patch<ApiResponse<Group>>(
      `${GROUP_SERVICE}admin/groups/${groupId}/reactivate`,
      {},
      { globalLoader: true },
    ),
  resetReportCount: (groupId: string) =>
    api.patch<ApiResponse<Group>>(
      `${GROUP_SERVICE}admin/groups/${groupId}/reset-report-count`,
      {},
      { globalLoader: true },
    ),
  suspendGroup: (groupId: string) =>
    api.patch<ApiResponse<Group>>(
      `${GROUP_SERVICE}admin/groups/${groupId}/suspend`,
      {},
      {
        globalLoader: true,
      },
    ),
};
