import { GroupsProvider } from "./_context/GroupsContext";
import type { Metadata } from "next";

// FR-SEO-CAN-03 — everything under /groups is either a search/filter result
// state (the directory itself) or the add-group flow, neither indexable.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <GroupsProvider>{children}</GroupsProvider>;
}
