import { ApiResponse } from "@/types/Common";
import { Permission } from "@/types/Permission";
import { CreateRolePayload, Role } from "@/types/Role";
import api from "../axiosConfig";

const ROLE_SERVICE = "/user-service/api/v1/admin";

export const RoleService = {
  listRoles: async () => api.get<ApiResponse<Role[]>>(`${ROLE_SERVICE}/roles`),
  roleById: async (id: number) => api.get<ApiResponse<Role>>(`${ROLE_SERVICE}/roles/${id}`),
  allPermissions: async () =>
    api.get<ApiResponse<Permission[]>>(`${ROLE_SERVICE}/roles/permissions`),
  createRole: async (data: CreateRolePayload) =>
    api.post<ApiResponse<Role>>(`${ROLE_SERVICE}/roles`, data, { globalLoader: true }),
  editPermissions: async (roleId: number, permissionIds: { permissionIds: number[] }) =>
    api.put<ApiResponse<Role>>(`${ROLE_SERVICE}/roles/${roleId}/permissions`, permissionIds, {
      globalLoader: true,
    }),
  editRoleDetails: async (roleId: number, payload: CreateRolePayload) =>
    api.patch<ApiResponse<Role>>(`${ROLE_SERVICE}/roles/${roleId}`, payload, {
      globalLoader: true,
    }),
  deleteRole: async (roleId: number) =>
    api.delete<ApiResponse<void>>(`${ROLE_SERVICE}/roles/${roleId}`, { globalLoader: true }),
};
