import { UserManagementProvider } from "@/app/internal/users/_context/UserManagementContext";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <UserManagementProvider>{children}</UserManagementProvider>;
}
