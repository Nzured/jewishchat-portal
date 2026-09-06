"use client";

import { usePathname } from "next/navigation";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { EXTERNAL_HOME_PATH } from "@/configs/const";

export function ShellLatticeBand() {
  const pathname = usePathname();
  if (pathname === EXTERNAL_HOME_PATH) return null;

  return <LatticeBackdrop className="fixed inset-x-0 top-12 -z-10 h-[220px] w-full" />;
}
