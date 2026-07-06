"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import AppHeader from "@/components/layout/app/AppHeader";
import { PermissionCategory } from "@/types/Permission";
import { Role } from "@/types/Role";
import { ALL_ROLES } from "../_components/roleData";
import {
  DEFAULT_GRANTED_PERMISSION_IDS,
  PERMISSION_CATEGORIES,
} from "./_components/permissionData";
import { PermissionsAccordion } from "./_components/PermissionsAccordion";
import { RoleActionsCard } from "./_components/RoleActionsCard";
import { RoleDetailsCard } from "./_components/RoleDetailsCard";
import RoleNavigation from "./_components/RoleNavigation";
import { RoleUsersCard } from "./_components/RoleUsersCard";

function RoleWorkspace({ role }: { role: Role }) {
  const [grantedIds, setGrantedIds] = useState<Set<string>>(
    () => new Set(DEFAULT_GRANTED_PERMISSION_IDS),
  );

  const handleToggle = (permissionId: string, granted: boolean) => {
    setGrantedIds((prev) => {
      const next = new Set(prev);
      if (granted) next.add(permissionId);
      else next.delete(permissionId);
      return next;
    });
  };

  const handleToggleCategory = (category: PermissionCategory, granted: boolean) => {
    setGrantedIds((prev) => {
      const next = new Set(prev);
      category.permissions.forEach((permission) => {
        if (granted) next.add(permission.id);
        else next.delete(permission.id);
      });
      return next;
    });
  };

  return (
    <div className="mt-2 flex flex-row gap-6">
      <div className="flex-3">
        <PermissionsAccordion
          categories={PERMISSION_CATEGORIES}
          grantedIds={grantedIds}
          onToggle={handleToggle}
          onToggleCategory={handleToggleCategory}
        />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <RoleDetailsCard role={role} />
        <RoleUsersCard role={role} />
        <RoleActionsCard
          role={role}
          onSaveChanges={() => toast.success(`Permissions saved for ${role.role}`)}
          onClearPermissions={() => setGrantedIds(new Set())}
        />
      </div>
    </div>
  );
}

export default function RolePage() {
  const params = useParams<{ role: string }>();
  const role = ALL_ROLES.find((r) => r.role === params.role) ?? ALL_ROLES[0];

  return (
    <>
      <RoleNavigation />
      <div className="mt-4">
        <AppHeader
          title={role.role}
          subtitle={role.description}
          count={ALL_ROLES.length}
          countLabel="Roles"
        />
      </div>
      <RoleWorkspace key={role.id} role={role} />
    </>
  );
}
