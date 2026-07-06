import { LucideIcon } from "lucide-react";

export interface Permission {
  id: string;
  label: string;
}

export interface PermissionCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  permissions: Permission[];
}
