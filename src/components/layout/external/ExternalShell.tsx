import { GradientBackdrop } from "@/components/ui/Aurora";
import { ExternalFooter } from "./ExternalFooter";
import { ExternalNavbar } from "./ExternalNavbar";
import { PendingGroupDraftRedirect } from "./PendingGroupDraftRedirect";

interface ExternalShellProps {
  children: React.ReactNode;
}

export function ExternalShell({ children }: ExternalShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Anchored to the top of the shell rather than the page content, so every
          external route gets the same wash under its first screenful. The navbar
          is opaque and sits above it, cropping off the top band. */}
      <GradientBackdrop />
      <ExternalNavbar />
      <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      <ExternalFooter />
      <PendingGroupDraftRedirect />
    </div>
  );
}
