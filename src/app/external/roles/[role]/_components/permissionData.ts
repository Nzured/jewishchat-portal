import { Settings, ShieldUser, SlidersHorizontal, UsersRound } from "lucide-react";
import { PermissionCategory } from "@/types/Permission";

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: "user-administration",
    title: "User administration",
    icon: Settings,
    permissions: [
      { id: "create-internal-users", label: "Create internal users" },
      { id: "reset-internal-passwords", label: "Reset internal passwords" },
      { id: "edit-delete-internal-accounts", label: "Edit / delete internal accounts" },
      { id: "assign-unassign-roles", label: "Assign / unassign roles" },
    ],
  },
  {
    id: "external-user-management",
    title: "External user management",
    icon: ShieldUser,
    permissions: [
      { id: "view-profiles", label: "View profiles" },
      { id: "reset-passwords", label: "Reset passwords" },
      { id: "modify-email-phone", label: "Modify email / phone" },
      { id: "suspend-users", label: "Suspend users" },
      { id: "blacklist-users", label: "Blacklist users" },
      { id: "reinstate-users", label: "Reinstate users" },
      { id: "send-notifications", label: "Send notifications" },
    ],
  },
  {
    id: "group-management",
    title: "Group management",
    icon: UsersRound,
    permissions: [
      { id: "create-groups", label: "Create groups" },
      { id: "edit-groups", label: "Edit groups" },
      { id: "suspend-groups", label: "Suspend groups" },
      { id: "feature-groups", label: "Feature groups" },
    ],
  },
  {
    id: "system-settings",
    title: "System settings",
    icon: SlidersHorizontal,
    permissions: [
      { id: "manage-categories", label: "Manage categories" },
      { id: "configure-notifications", label: "Configure notifications" },
      { id: "view-audit-logs", label: "View audit logs" },
    ],
  },
];

export const DEFAULT_GRANTED_PERMISSION_IDS = ["create-internal-users", "view-profiles"];
