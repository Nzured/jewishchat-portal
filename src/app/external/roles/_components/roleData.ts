import { Role } from "@/types/Role";

export const ALL_ROLES: Role[] = [
  {
    id: "1",
    role: "Admin",
    description: "Full access to all system features and settings.",
    users: [
      { id: "u1", name: "Alice Cohen" },
      { id: "u2", name: "Moshe Levi" },
      { id: "u3", name: "Sarah Klein" },
      { id: "u4", name: "David Rosen" },
    ],
  },
  {
    id: "2",
    role: "Moderator",
    description: "Can review and manage user-submitted content and reports.",
    users: [
      { id: "u5", name: "Rachel Green" },
      { id: "u6", name: "Yosef Stern" },
    ],
  },
  {
    id: "3",
    role: "Editor",
    description: "Can create and edit content but cannot manage users or settings.",
    users: [
      { id: "u7", name: "Miriam Gold" },
      { id: "u8", name: "Binyamin Weiss" },
      { id: "u9", name: "Leah Shapiro" },
    ],
  },
  {
    id: "4",
    role: "Support",
    description: "Handles user inquiries and basic account management.",
    users: [
      { id: "u10", name: "Rivka Friedman" },
      { id: "u11", name: "Nachum Katz" },
      { id: "u12", name: "Devorah Silver" },
      { id: "u13", name: "Pinchas Blum" },
      { id: "u14", name: "Chana Horowitz" },
    ],
  },
  {
    id: "5",
    role: "Viewer",
    description: "Read-only access to reports and dashboards.",
    users: [{ id: "u15", name: "Tzipora Braun" }],
  },
  {
    id: "6",
    role: "Analyst",
    description: "Access to analytics and reporting tools.",
    users: [],
  },
];
