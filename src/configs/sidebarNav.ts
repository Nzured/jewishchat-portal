import { Flag, LayoutGrid, MessageSquare, Tag, Upload, UserCog, Users } from "lucide-react";
import type { SidebarNavSection } from "@/types/Navigation";
import { UserType } from "@/types/User";

const ADMIN_NAV_SECTIONS: SidebarNavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/external", icon: LayoutGrid }],
  },
  {
    label: "Users",
    items: [
      { label: "User Management", href: "/external/users", icon: Users },
      { label: "Role Management", href: "/external/roles", icon: UserCog },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Group Management", href: "/external/groups", icon: MessageSquare },
      { label: "Report Management", href: "/external/reports", icon: Flag },
      { label: "Category Management", href: "/external/categories", icon: Tag },
    ],
  },
  {
    label: "System",
    items: [{ label: "Bulk Update", href: "/external/bulk-update", icon: Upload }],
  },
];

const INTERNAL_NAV_SECTIONS: SidebarNavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/internal", icon: LayoutGrid }],
  },
];

export const SIDEBAR_NAV_BY_USER_TYPE: Record<UserType, SidebarNavSection[]> = {
  [UserType.EXTERNAL]: ADMIN_NAV_SECTIONS,
  [UserType.INTERNAL]: INTERNAL_NAV_SECTIONS,
};
