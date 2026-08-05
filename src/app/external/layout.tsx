import { ExternalShell } from "@/components/layout/external/ExternalShell";

export default function ExternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ExternalShell>{children}</ExternalShell>;
}
