import { AppShell } from "@/components/layout/app/AppShell";
import { UserType } from "@/types/User";

export default function InternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell title="Internal Portal" userType={UserType.INTERNAL}>
      {children}
    </AppShell>
  );
}
