import { GroupsProvider } from "./_context/GroupsContext";

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return <GroupsProvider>{children}</GroupsProvider>;
}
