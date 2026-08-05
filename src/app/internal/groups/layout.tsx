import { AdminGroupProvider } from "@/app/internal/groups/_context/AdminGroupContext";

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <AdminGroupProvider>{children}</AdminGroupProvider>;
}
