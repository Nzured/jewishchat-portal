import { ExternalShell } from "@/components/layout/external/ExternalShell";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

export default function ExternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScroll>
      <ExternalShell>{children}</ExternalShell>
    </SmoothScroll>
  );
}
