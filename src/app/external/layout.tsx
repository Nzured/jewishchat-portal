import { AppShell } from "@/components/layout/app/AppShell";
import { SearchFilterProvider } from "@/contexts/SearchFilterContext";
import { UserType } from "@/types/User";

export default function ExternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SearchFilterProvider>
      <AppShell title="JewishChat" userType={UserType.EXTERNAL}>
        {children}
      </AppShell>
    </SearchFilterProvider>
  );
}
