import axios from "axios";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  GROUP_PHOTO_UPLOAD_CONTENT_TYPE,
  GROUP_SERVICE,
} from "@/configs/const";
import { Category, CategoryDetail } from "@/types/Category";
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
  GroupViewPayload,
  JoinRedirectResponse,
  JoinTokenResponse,
  MyGroupsResponse,
  UpdateGroupPayload,
  WhatsappUrlCheckResponse,
} from "@/types/Group";
import {
  AdminGroupReportsPage,
  ReportDetailResponse,
  ReportGroupPayload,
  ReportThresholdsResponse,
  UpdateReportThresholdsPayload,
} from "@/types/Report";
import { ActiveCountries, PlatformStats } from "@/types/Stats";
import api from "../axiosConfig";

export interface SuspendGroupPayload {
  category: string;
  reason: string;
}

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
      params: { search, location, category, page, size: pageSize, sort },
    }),
  getGroupByCategoryAndSlug: (categorySlug: string, groupSlug: string) =>
    api.get<ApiResponse<Group>>(`${GROUP_SERVICE}groups/${categorySlug}/${groupSlug}`),
  recordGroupView: (uuid: string, payload: GroupViewPayload) =>
    api.post<ApiResponse<void>>(`${GROUP_SERVICE}groups/${uuid}/view`, payload, {
      silentError: true,
    }),
  startGroupJoin: (slug: string) =>
    api.post<ApiResponse<JoinTokenResponse>>(
      `${GROUP_SERVICE}groups/${encodeURIComponent(slug)}/join`,
      {},
      { silentError: true },
    ),
  redeemJoinToken: (token: string) =>
    api.get<ApiResponse<JoinRedirectResponse>>(
      `${GROUP_SERVICE}groups/join/${encodeURIComponent(token)}`,
      { silentError: true },
    ),
  getRelatedGroups: (uuid: string) =>
    api.get<ApiResponse<Group[]>>(`${GROUP_SERVICE}groups/by-uuid/${uuid}/related`),
  getGroupsBySubmitter: (
    userUuid: string,
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    sort: string = DEFAULT_SORT,
  ) =>
    api.get<ApiResponse<GroupsPage>>(`${GROUP_SERVICE}groups/by-submitter/${userUuid}`, {
      params: { page, size: pageSize, sort },
    }),
  getMyGroups: (
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    sort: string = DEFAULT_SORT,
  ) =>
    api.get<ApiResponse<MyGroupsResponse>>(`${GROUP_SERVICE}groups/my`, {
      params: { page, size: pageSize, sort },
    }),
  getDraftId: () =>
    api.post<ApiResponse<GroupDraftRef>>(
      `${GROUP_SERVICE}groups/drafts`,
      {},
      { globalLoader: true },
    ),
  checkWhatsappUrl: (url: string, excludeDraftId?: string) =>
    api.get<WhatsappUrlCheckResponse>(`${GROUP_SERVICE}groups/check-whatsapp-url`, {
      params: { url, excludeDraftId },
      skipAuthRefresh: true,
    }),
  getDraft: (draftId: string) =>
    api.get<ApiResponse<GroupDraft>>(`${GROUP_SERVICE}groups/drafts/${draftId}`),
  deleteDraft: (draftId: string) =>
    api.delete<ApiResponse<void>>(`${GROUP_SERVICE}groups/drafts/${draftId}`),
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
  getGroupPhotoUploadUrl: (uuid: string) =>
    api.post<ApiResponse<GetPhotoUrlResponse>>(`${GROUP_SERVICE}groups/${uuid}/photo`, {}),
  updateGroup: (uuid: string, payload: UpdateGroupPayload) =>
    api.patch<ApiResponse<Group>>(`${GROUP_SERVICE}groups/${uuid}`, payload, {
      globalLoader: true,
    }),
  getPlatformStats: () => api.get<ApiResponse<PlatformStats>>(`${GROUP_SERVICE}groups/stats`),
  getActiveCountries: () =>
    api.get<ApiResponse<ActiveCountries>>(`${GROUP_SERVICE}groups/stats/active-countries`),
  deleteGroup: (uuid: string) => api.delete<ApiResponse<void>>(`${GROUP_SERVICE}groups/${uuid}`),
  getCategories: () => api.get<ApiResponse<Category[]>>(`${GROUP_SERVICE}groups/categories`),
  getCategoryBySlug: (slug: string) =>
    api.get<ApiResponse<CategoryDetail>>(`${GROUP_SERVICE}groups/categories/${slug}`),
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
      params: { search, status, category, page, size: pageSize, sort },
    }),
  getGroupByUuidAdmin: (uuid: string) =>
    api.get<ApiResponse<Group>>(`${GROUP_SERVICE}admin/groups/${uuid}`),
  groupsForAdminReview: (page: number = DEFAULT_PAGE, pageSize: number = DEFAULT_PAGE_SIZE) =>
    api.get<ApiResponse<GroupsPage>>(`${GROUP_SERVICE}admin/groups/manual-review`, {
      params: { page, size: pageSize },
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
  suspendGroup: (groupId: string, payload?: SuspendGroupPayload) =>
    api.patch<ApiResponse<Group>>(
      `${GROUP_SERVICE}admin/groups/${groupId}/suspend`,
      payload ?? {},
      { globalLoader: true },
    ),
  reportGroup: (uuid: string, payload: ReportGroupPayload) =>
    api.post<ApiResponse<void>>(`${GROUP_SERVICE}groups/${uuid}/report`, payload, {
      globalLoader: true,
    }),
  getAdminGroupReports: (
    resolved: boolean = false,
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    sort?: string,
  ) =>
    api.get<ApiResponse<AdminGroupReportsPage>>(`${GROUP_SERVICE}admin/groups/reports`, {
      params: { resolved, page, size: pageSize, sort },
    }),
  getReport: (reportId: string) =>
    api.get<ApiResponse<ReportDetailResponse>>(`${GROUP_SERVICE}admin/groups/reports/${reportId}`),
  resolveReport: (reportId: number, dismiss: boolean = false) =>
    api.patch<ApiResponse<void>>(
      `${GROUP_SERVICE}admin/groups/reports/${reportId}/resolve`,
      {},
      { params: { dismiss }, globalLoader: true },
    ),
  getReportThresholds: () =>
    api.get<ApiResponse<ReportThresholdsResponse>>(
      `${GROUP_SERVICE}admin/groups/report-thresholds`,
    ),
  updateReportThresholds: (payload: UpdateReportThresholdsPayload) =>
    api.put<ApiResponse<ReportThresholdsResponse>>(
      `${GROUP_SERVICE}admin/groups/report-thresholds`,
      payload,
      { globalLoader: true },
    ),
  resolveAllReports: (uuid: string, dismiss: boolean = false) =>
    api.patch<ApiResponse<void>>(
      `${GROUP_SERVICE}admin/groups/${uuid}/reports/resolve-all`,
      {},
      { params: { dismiss }, globalLoader: true },
    ),
};
