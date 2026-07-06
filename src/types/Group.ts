import { UserRef } from "./User";

export enum GroupStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export interface Group {
  groupName: string;
  id: string;
  path: string;
  groupImage?: string;
  categories: string[];
  memborCount: number;
  createdBy: UserRef;
  reportCount: number;
  lastReported: string;
  status: GroupStatus;
  mainCategory: string;
  subCategories?: string[];
  createdDate: string;
}
