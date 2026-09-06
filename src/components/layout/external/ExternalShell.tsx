import { ExternalFooter } from "./ExternalFooter";
import { ExternalNavbar } from "./ExternalNavbar";
import { PendingGroupDraftRedirect } from "./PendingGroupDraftRedirect";
import { ShellLatticeBand } from "./ShellLatticeBand";

interface ExternalShellProps {
  children: React.ReactNode;
}

export function ExternalShell({ children }: ExternalShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ExternalNavbar />
      <ShellLatticeBand />
      <main className="flex-1 px-4 py-4 md:px-8">{children}</main>
      <ExternalFooter />
      <PendingGroupDraftRedirect />
    </div>
  );
}
