import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Groups",
};

export default function MyGroupsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
