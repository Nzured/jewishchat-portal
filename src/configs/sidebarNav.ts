import { Flag, LayoutGrid, MessageSquare, Tag, UserCog, Users } from "lucide-react";
import type { SidebarNavSection } from "@/types/Navigation";
import { UserType } from "@/types/User";

const ADMIN_NAV_SECTIONS: SidebarNavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/internal", icon: LayoutGrid }],
  },
  {
    label: "Users",
    items: [
      { label: "User Management", href: "/internal/users", icon: Users },
      { label: "Role Management", href: "/internal/roles", icon: UserCog },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Group Management", href: "/internal/groups", icon: MessageSquare },
      { label: "Report Management", href: "/internal/reports", icon: Flag },
      { label: "Category Management", href: "/internal/categories", icon: Tag },
    ],
  },
  // {
  //   label: "System",
  //   items: [{ label: "Bulk Update", href: "/internal/bulk-update", icon: Upload }],
  // },
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
