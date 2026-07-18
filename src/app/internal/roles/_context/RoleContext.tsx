"use client";

import * as React from "react";
import { RoleService } from "@/services/roles/role.service";
import { Permission } from "@/types/Permission";
import { CreateRolePayload, Role } from "@/types/Role";

interface RoleContextType {
  roles: Role[];
  rolesLoading: boolean;
  refetchRoles: () => Promise<void>;
  getRoleById: (id: number) => Role | undefined;
  permissions: Permission[];
  permissionsLoaded: boolean;
  fetchAllPermissions: () => Promise<void>;
  createRole: (values: CreateRolePayload) => Promise<Role>;
  editPermissions: (roleId: number, permissionIds: number[]) => Promise<Role>;
  editRoleDetails: (roleId: number, payload: CreateRolePayload) => Promise<Role>;
  deleteRole: (roleId: number) => Promise<void>;
  saveRoleChanges: (role: Role, draft: RoleDraft) => Promise<void>;
}

interface RoleDraft {
  name: string;
  description: string;
  permissionIds: Set<number>;
}

function setsEqual(a: Set<number>, b: Set<number>) {
  return a.size === b.size && [...a].every((value) => b.has(value));
}

export function getRoleChanges(role: Role, draft: RoleDraft) {
  const originalPermissionIds = new Set(role.permissions.map((p) => p.id));
  const permissionsChanged = !setsEqual(draft.permissionIds, originalPermissionIds);
  const detailsChanged = draft.name !== role.name || draft.description !== role.description;
  return { permissionsChanged, detailsChanged, hasChanges: permissionsChanged || detailsChanged };
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;

    async function fetchRoles() {
      try {
        const res = await RoleService.listRoles();
        if (!ignore) setRoles(res?.data ?? []);
      } catch {
        if (!ignore) setRoles([]);
      } finally {
        if (!ignore) setRolesLoading(false);
      }
    }

    void fetchRoles();

    return () => {
      ignore = true;
    };
  }, []);

  const refetchRoles = React.useCallback(async () => {
    setRolesLoading(true);
    try {
      const res = await RoleService.listRoles();
      setRoles(res?.data ?? []);
    } catch {
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const fetchAllPermissions = React.useCallback(async () => {
    try {
      const res = await RoleService.allPermissions();
      setPermissions(res?.data ?? []);
    } catch {
      setPermissions([]);
    } finally {
      setPermissionsLoaded(true);
    }
  }, []);

  const getRoleById = React.useCallback(
    (id: number) => roles.find((role) => role.id === id),
    [roles],
  );

  const createRole = React.useCallback(async (values: CreateRolePayload) => {
    const res = await RoleService.createRole(values);
    setRoles((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const editPermissions = React.useCallback(async (roleId: number, permissionIds: number[]) => {
    const res = await RoleService.editPermissions(roleId, { permissionIds: permissionIds });
    setRoles((prev) => prev.map((role) => (role.id === roleId ? res.data : role)));
    return res.data;
  }, []);

  const editRoleDetails = React.useCallback(async (roleId: number, payload: CreateRolePayload) => {
    const res = await RoleService.editRoleDetails(roleId, payload);
    setRoles((prev) => prev.map((role) => (role.id === roleId ? res.data : role)));
    return res.data;
  }, []);

  const deleteRole = React.useCallback(async (roleId: number) => {
    await RoleService.deleteRole(roleId);
    setRoles((prev) => prev.filter((role) => role.id !== roleId));
  }, []);

  const saveRoleChanges = React.useCallback(
    async (role: Role, draft: RoleDraft) => {
      const { permissionsChanged, detailsChanged } = getRoleChanges(role, draft);
      if (permissionsChanged) await editPermissions(role.id, [...draft.permissionIds]);
      if (detailsChanged)
        await editRoleDetails(role.id, { name: draft.name, description: draft.description });
    },
    [editPermissions, editRoleDetails],
  );

  return (
    <RoleContext.Provider
      value={{
        roles,
        rolesLoading,
        refetchRoles,
        getRoleById,
        fetchAllPermissions,
        permissions,
        permissionsLoaded,
        createRole,
        editPermissions,
        editRoleDetails,
        deleteRole,
        saveRoleChanges,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRoles() {
  const context = React.useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRoles must be used within a RoleProvider");
  }
  return context;
}
