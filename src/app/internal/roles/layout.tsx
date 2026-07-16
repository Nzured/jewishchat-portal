import { RoleProvider } from "@/app/internal/roles/_context/RoleContext";

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  return <RoleProvider>{children}</RoleProvider>;
}
