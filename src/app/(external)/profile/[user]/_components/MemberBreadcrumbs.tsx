"use client";

import { useSearchParams } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getMemberProfileCrumbs } from "@/lib/publicPaths";

export function MemberBreadcrumbs({ memberName }: { memberName: string }) {
  const searchParams = useSearchParams();
  return <Breadcrumbs items={getMemberProfileCrumbs(memberName, searchParams)} />;
}
