import { Permission } from "@/types/Permission";

export interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: Permission[];
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissionIds?: number[];
}
