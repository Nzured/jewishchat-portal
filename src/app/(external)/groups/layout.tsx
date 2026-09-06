import { GroupsProvider } from "./_context/GroupsContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <GroupsProvider>{children}</GroupsProvider>;
}
