import type { LucideIcon } from "lucide-react";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface SidebarNavSection {
  label?: string;
  items: SidebarNavItem[];
}
