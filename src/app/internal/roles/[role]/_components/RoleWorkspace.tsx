"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getRoleChanges, useRoles } from "@/app/internal/roles/_context/RoleContext";
import { Permission } from "@/types/Permission";
import { Role } from "@/types/Role";
import { PermissionsAccordion } from "./PermissionsAccordion";
import { RoleActionsCard } from "./RoleActionsCard";
import { RoleDetailsCard } from "./RoleDetailsCard";

interface RoleWorkspaceProps {
  role: Role;
  permissions: Permission[];
}

export function RoleWorkspace({ role, permissions }: RoleWorkspaceProps) {
  const { saveRoleChanges, deleteRole } = useRoles();
  const [grantedIds, setGrantedIds] = useState<Set<number>>(
    () => new Set(role.permissions.map((p) => p.id)),
  );
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);

  const { hasChanges } = getRoleChanges(role, { name, description, permissionIds: grantedIds });

  const handleToggle = (permissionId: number, granted: boolean) => {
    setGrantedIds((prev) => {
      const next = new Set(prev);
      if (granted) next.add(permissionId);
      else next.delete(permissionId);
      return next;
    });
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) return;

    try {
      await saveRoleChanges(role, { name, description, permissionIds: grantedIds });
      toast.success(`Changes saved for ${role.name}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    }
  };

  const handleDelete = async () => {
    await deleteRole(role.id);
    toast.success(`${role.name} deleted`);
  };

  return (
    <div className="mt-2 flex flex-col gap-6 md:flex-row">
      <div className="order-2 flex-3 md:order-1">
        <PermissionsAccordion
          permissions={permissions}
          grantedIds={grantedIds}
          onToggle={handleToggle}
        />
      </div>
      <div className="order-1 flex flex-1 flex-col gap-4 md:order-2">
        <RoleDetailsCard
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
        />
        <RoleActionsCard
          role={role}
          onSaveChanges={handleSaveChanges}
          onDelete={handleDelete}
          onClearPermissions={() => setGrantedIds(new Set())}
          saveDisabled={!hasChanges}
        />
      </div>
    </div>
  );
}
