import { Aurora } from "@/components/ui/Aurora";
import { ExternalFooter } from "./ExternalFooter";
import { ExternalNavbar } from "./ExternalNavbar";
import { PendingGroupDraftRedirect } from "./PendingGroupDraftRedirect";

interface ExternalShellProps {
  children: React.ReactNode;
}

// Mirrors --color-aurora-start/mid/end in globals.css. Kept as hex literals here
// since the Aurora shader parses these directly and can't resolve CSS vars.
const AURORA_COLOR_STOPS: [string, string, string] = ["#C6F5EE", "#9BE8DC", "#DCF8EF"];

export function ExternalShell({ children }: ExternalShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Anchored to the top of the shell rather than the page content, so every
          external route gets the same wash under its first screenful. The navbar
          is opaque and sits above it, cropping off the top band. */}
      <Aurora
        colorStops={AURORA_COLOR_STOPS}
        amplitude={0.55}
        blend={0.8}
        speed={0.28}
        intensity={1.4}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] sm:h-[420px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      />
      <ExternalNavbar />
      <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      <ExternalFooter />
      <PendingGroupDraftRedirect />
    </div>
  );
}
