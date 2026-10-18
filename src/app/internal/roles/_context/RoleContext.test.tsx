import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Role } from "@/types/Role";
import { getRoleChanges, RoleProvider, useRoles } from "./RoleContext";

const service = vi.hoisted(() => ({
  listRoles: vi.fn(),
  allPermissions: vi.fn(),
  createRole: vi.fn(),
  editPermissions: vi.fn(),
  editRoleDetails: vi.fn(),
  deleteRole: vi.fn(),
}));

vi.mock("@/services/roles/role.service", () => ({ RoleService: service }));

const role = {
  id: 1,
  name: "Moderator",
  description: "Moderates",
  permissions: [{ id: 10 }, { id: 11 }],
} as unknown as Role;

function draft(overrides: Partial<{ name: string; description: string; ids: number[] }> = {}) {
  return {
    name: overrides.name ?? role.name,
    description: overrides.description ?? role.description,
    permissionIds: new Set(overrides.ids ?? [10, 11]),
  };
}

describe("getRoleChanges", () => {
  it("reports no changes for an untouched draft", () => {
    expect(getRoleChanges(role, draft())).toEqual({
      permissionsChanged: false,
      detailsChanged: false,
      hasChanges: false,
    });
  });

  it("ignores permission order", () => {
    expect(getRoleChanges(role, draft({ ids: [11, 10] })).permissionsChanged).toBe(false);
  });

  it("detects added, removed and swapped permissions", () => {
    expect(getRoleChanges(role, draft({ ids: [10, 11, 12] })).permissionsChanged).toBe(true);
    expect(getRoleChanges(role, draft({ ids: [10] })).permissionsChanged).toBe(true);
    expect(getRoleChanges(role, draft({ ids: [10, 12] })).permissionsChanged).toBe(true);
  });

  it("detects name and description edits", () => {
    expect(getRoleChanges(role, draft({ name: "Mod" })).detailsChanged).toBe(true);
    expect(getRoleChanges(role, draft({ description: "" })).hasChanges).toBe(true);
  });
});

describe("RoleProvider", () => {
  function wrapper({ children }: { children: ReactNode }) {
    return <RoleProvider>{children}</RoleProvider>;
  }

  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.listRoles.mockResolvedValue({ data: [role] });
  });

  it("loads roles on mount", async () => {
    const { result } = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(result.current.rolesLoading).toBe(false));
    expect(result.current.getRoleById(1)).toEqual(role);
    expect(result.current.getRoleById(2)).toBeUndefined();
  });

  it("falls back to an empty list when loading fails", async () => {
    service.listRoles.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(result.current.rolesLoading).toBe(false));
    expect(result.current.roles).toEqual([]);
  });

  it("only calls the endpoints for what changed", async () => {
    service.editRoleDetails.mockResolvedValue({ data: { ...role, name: "Mod" } });
    const { result } = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(result.current.rolesLoading).toBe(false));

    await act(() => result.current.saveRoleChanges(role, draft({ name: "Mod" })));

    expect(service.editPermissions).not.toHaveBeenCalled();
    expect(service.editRoleDetails).toHaveBeenCalledWith(1, {
      name: "Mod",
      description: "Moderates",
    });
    expect(result.current.getRoleById(1)?.name).toBe("Mod");
  });

  it("saves permissions and details when both changed", async () => {
    service.editPermissions.mockResolvedValue({ data: role });
    service.editRoleDetails.mockResolvedValue({ data: role });
    const { result } = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(result.current.rolesLoading).toBe(false));

    await act(() =>
      result.current.saveRoleChanges(role, draft({ name: "Mod", ids: [10] })),
    );

    expect(service.editPermissions).toHaveBeenCalledWith(1, { permissionIds: [10] });
    expect(service.editRoleDetails).toHaveBeenCalledTimes(1);
  });

  it("adds created roles and removes deleted ones", async () => {
    service.createRole.mockResolvedValue({ data: { ...role, id: 2, name: "Viewer" } });
    service.deleteRole.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(result.current.rolesLoading).toBe(false));

    await act(() => result.current.createRole({ name: "Viewer", description: "" }));
    expect(result.current.roles.map((r) => r.id)).toEqual([1, 2]);

    await act(() => result.current.deleteRole(1));
    expect(result.current.roles.map((r) => r.id)).toEqual([2]);
  });

  it("marks permissions loaded even when the request fails", async () => {
    service.allPermissions.mockRejectedValue(new Error("down"));
    const { result } = renderHook(() => useRoles(), { wrapper });
    await act(() => result.current.fetchAllPermissions());
    expect(result.current.permissionsLoaded).toBe(true);
    expect(result.current.permissions).toEqual([]);
  });
});
