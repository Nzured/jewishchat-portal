"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRoles } from "@/app/internal/roles/_context/RoleContext";
import AppHeader from "@/components/layout/app/AppHeader";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import RoleNavigation from "./_components/RoleNavigation";
import { RoleWorkspace } from "./_components/RoleWorkspace";
import { RoleWorkspaceSkeleton } from "./_components/RoleWorkspaceSkeleton";

export default function RolePage() {
  const params = useParams<{ role: string }>();
  const router = useRouter();
  const {
    getRoleById,
    refetchRoles,
    fetchAllPermissions,
    permissions,
    permissionsLoaded,
    rolesLoading,
  } = useRoles();
  const role = getRoleById(Number(params.role)) ?? null;
  const isFirstRender = useRef(true);
  const isLoading = rolesLoading || !permissionsLoaded;

  useEffect(() => {
    void fetchAllPermissions();
  }, [fetchAllPermissions]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    void refetchRoles();
  }, [params.role, refetchRoles]);

  useEffect(() => {
    if (role || rolesLoading) return;
    toast.error("This role no longer exists.");
    router.replace("/internal/roles");
  }, [role, rolesLoading, router]);

  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <RoleNavigation />
      <AppHeader
        title={wordFormatter(role?.name)}
        subtitle={role?.description ?? ""}
        count={role?.permissions.length}
        countLabel="Roles"
        stickyTop="top-21"
      />
      {isLoading ? (
        <RoleWorkspaceSkeleton />
      ) : (
        role && <RoleWorkspace key={params.role} role={role} permissions={permissions} />
      )}
    </div>
  );
}
