export enum UserType {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

export enum UserStatus {
  SUSPENDED = "SUSPENDED",
  ACTIVE = "ACTIVE",
}

export interface UserRef {
  id: number | string;
  name: string;
  joinedDate?: string;
  profilePic?: string;
}

export interface User extends UserTableData {
  uuid: string;
  emailVerified: boolean;
  permissions: string[];
  superAdmin: boolean;
  // lastActive: string;
  // addedGroups: Group[];
  userType: UserType;
  roles: string[];
}

export interface UserTableData {
  firstName: string;
  lastName: string;
  joinedDate: string;
  profilePic?: string;
  email: string;
  status: UserStatus;
  mobile?: string;
  whatsappVerified: boolean;
  role: string;
}
export interface Admin {
  userType: UserType;
}

//  "can_manage_categories",
//     "can_view_groups",
//     "can_manage_external_users",
//     "can_reactivate_groups",
//     "can_view_audit_trail",
//     "can_suspend_groups",
//     "can_resolve_reports",
//     "can_delete_groups",
//     "can_bulk_upload_groups",
//     "can_assign_roles",
//     "can_manage_system_config",
//     "can_view_reports",
//     "can_manage_internal_users",
