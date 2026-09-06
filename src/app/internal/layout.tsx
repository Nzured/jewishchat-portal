import { AppShell } from "@/components/layout/app/AppShell";
import { NAME_PART_ONE, NAME_PART_TWO } from "@/configs/const";
import { SearchFilterProvider } from "@/contexts/SearchFilterContext";
import { UserType } from "@/types/User";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ExternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SearchFilterProvider>
      <AppShell title={NAME_PART_ONE + NAME_PART_TWO} userType={UserType.EXTERNAL}>
        {children}
      </AppShell>
    </SearchFilterProvider>
  );
}
