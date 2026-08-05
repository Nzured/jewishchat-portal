import { Category } from "./Category";
import { Paginated } from "./Common";

export enum GroupStatus {
  STARTED = "STARTED",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  PENDING_MODERATION = "PENDING_MODERATION",
  MANUAL_REVIEW = "MANUAL_REVIEW",
}

export interface Group {
  uuid: string;
  slug: string;
  name: string;
  shortDesc: string;
  about: string;
  whatsappLink?: string;
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
  isOwnGroup: boolean;
  ownerProfileUrl: string;
  createdOn: string;
  updatedOn: string;
}

export type GroupsPage = Paginated<"groups", Group>;

/** Newly created (or resumed) group draft the step endpoints are keyed by. */
export interface GroupDraftRef {
  draftId: string;
  status: GroupStatus;
  createdAt: string;
  lastUpdatedAt: string;
}

/** Group details captured on step 1 of the create-group stepper. */
export interface GroupDraftStep1Payload {
  whatsappLink: string;
  name: string;
  shortDesc: string;
  about: string;
  linkVisibilityLoggedInOnly: boolean;
}

/** Categorization + location captured on step 2 of the create-group stepper. */
export interface GroupDraftStep2Payload {
  mainCategoryId: number;
  additionalCategoryIds: number[];
  locationCity: string;
  locationState: string;
  locationCountry: string;
  memberCount: number;
}

/** Draft echoed back by the step endpoints. Each `stepNData` is the saved payload as a JSON string. */
export interface GroupDraft extends GroupDraftRef {
  step1Data?: string;
  step2Data?: string;
}

/**
 * Field shapes for the create-group stepper. All steps share a single
 * react-hook-form instance, so every step component is typed against
 * `CreateGroupFormValues` rather than its own slice — `Control<A & B>` is not
 * assignable to `Control<B>`.
 */

/** Step 1 — group details. */
export interface GroupDetailsFormValues {
  whatsappLink: string;
  name: string;
  shortDesc: string;
  about: string;
  linkVisibilityLoggedInOnly: boolean;
}

/** Step 2 — categorization and location. */
export interface CategorizationFormValues {
  mainCategoryId: number | null;
  /** Extra categories, never including the main one. */
  additionalCategoryIds: number[];
  locationCountry: string;
  locationState: string;
  locationCity: string;
  memberCount?: number;
}

/** Final step — the group photo, chosen in the browser and uploaded on submit. */
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
