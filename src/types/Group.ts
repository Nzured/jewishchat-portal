import { Category } from "./Category";
import { Paginated } from "./Common";
import { UserSummary } from "./User";

export enum GroupStatus {
  STARTED = "STARTED",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING_MODERATION = "PENDING_MODERATION",
  MANUAL_REVIEW = "MANUAL_REVIEW",
}

export interface GroupOwnerRef {
  uuid: string;
  firstName: string;
  lastName: string;
  joinedOn?: string;
}

export interface Group {
  uuid: string;
  slug: string;
  name: string;
  thumbnailUrl?: string | null;
  shortDesc: string;
  about: string;
  whatsappLink?: string;
  joinUrl?: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  memberCount: number;
  status: GroupStatus;
  linkVisibilityLoggedInOnly: boolean;
  submittedByUuid: string;
  mainCategory: Category;
  categories: Category[];
  totalViews: number;
  uniqueViews: number;
  totalJoinClicks: number;
  uniqueJoinClicks: number;
  reportCount: number;
  createdBy: string;
  updatedBy: string;
  createdOn: string;
  updatedOn: string;
  owner?: GroupOwnerRef;
  isOwnGroup?: boolean;
  ownerProfileUrl?: string;
  createdByUser?: UserSummary;
  updatedByUser?: UserSummary;
  suspensionCategory?: string;
  suspensionReason?: string;
}

export interface JoinTokenResponse {
  token: string;
  requiresAuth?: boolean;
}

export interface JoinRedirectResponse {
  redirectUrl: string;
}

export interface GroupViewPayload {
  fingerprint?: string;
  referralSource?: string;
  searchQuery?: string;
}

export type GroupsPage = Paginated<"groups", Group>;

export interface MyGroupsResponse {
  groups: Group[];
  drafts: GroupDraft[];
  totalPages: number;
  currentPage: number;
  totalGroups: number;
}

export interface GroupDraftRef {
  draftId: string;
  status: GroupStatus;
  createdAt: string;
  lastUpdatedAt: string;
  expiresAt?: string;
  expiresInSeconds?: number;
}

export interface GroupDraftStep1Payload {
  whatsappLink: string;
  name: string;
  shortDesc: string;
  about: string;
  linkVisibilityLoggedInOnly: boolean;
}

export interface GroupDraftStep2Payload {
  mainCategoryId: number;
  additionalCategoryIds: number[];
  locationCity: string;
  locationState: string;
  locationCountry: string;
  memberCount: number;
}

export interface WhatsappUrlCheckResponse {
  message: string;
  statusCode: number;
  errorCode: string;
}

export interface UpdateGroupPayload extends GroupDraftStep1Payload, GroupDraftStep2Payload {
  resubmissionMessage?: string;
}
export interface GroupDraft extends GroupDraftRef {
  step1Data?: string;
  step2Data?: string;
}

export interface GroupDetailsFormValues {
  whatsappLink: string;
  name: string;
  shortDesc: string;
  about: string;
  linkVisibilityLoggedInOnly: boolean;
}

export interface CategorizationFormValues {
  mainCategoryId: number | null;
  additionalCategoryIds: number[];
  locationCountry: string;
  locationState: string;
  locationCity: string;
  memberCount?: number;
}

export interface GroupPhotoFormValues {
  image: File | null;
}

export interface CreateGroupFormValues
  extends GroupDetailsFormValues, CategorizationFormValues, GroupPhotoFormValues {}

export interface GetPhotoUrlResponse {
  fileKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
}
