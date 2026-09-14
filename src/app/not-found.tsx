import { ExternalShell } from "@/components/layout/external/ExternalShell";
import { NotFound } from "@/components/ui/NotFound";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function RootNotFoundPage() {
  return (
    <ExternalShell>
      <NotFound />
    </ExternalShell>
  );
}
