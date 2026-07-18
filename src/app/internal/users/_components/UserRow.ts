import { UserTableData, UserType } from "@/types/User";

export interface UserRow extends UserTableData {
  id: string;
  userType: UserType;
}
