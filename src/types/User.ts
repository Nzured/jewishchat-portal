import { Group } from "./Group";

export enum UserType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

export enum UserStatus {
  SUSPENDED = "SUSPENDED",
  ACTIVE = "ACTIVE",
}

export interface UserTableData {
  name: string;
  joinedDate: string;
  profilePic?: string;
  email: string;
  status: UserStatus;
  mobile?: string;
  mobileNumberVerified: boolean;
  role: string;
}

export interface UserRef {
  id: number | string;
  name: string;
  joinedDate?: string;
  profilePic?: string;
}

export interface User extends UserTableData {
  userType: UserType;
  id: number | string;
  lastActive: string;
  addedGroups: Group[];
}
