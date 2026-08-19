export interface ExternalNavLink {
  label: string;
  href: string;
}

export const EXTERNAL_NAV_LINKS: ExternalNavLink[] = [
  { label: "Find Groups", href: "/groups" },
  { label: "Add Group", href: "/groups/new" },
];
