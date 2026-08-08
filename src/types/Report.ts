import { Group } from "./Group";
import { UserRef } from "./User";

export enum ReportCategories {
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  LINK_NOT_WORKING = "LINK_NOT_WORKING",
  RESUBMISSION_MESSAGE = "RESUBMISSION_MESSAGE",
}

export interface Report {
  id: number;
  reportedBy: UserRef;
  reason: ReportCategories;
  reportedDate: string;
  description: string;
  group: Group;
  reviewed?: boolean;
}
