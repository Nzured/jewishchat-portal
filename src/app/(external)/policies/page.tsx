import { UnderConstruction } from "@/components/ui/UnderConstruction";
import type { Metadata } from "next";

// FR-SEO-CAN-03 — noindex until there's real content here (Priority 11).
export const metadata: Metadata = {
  title: "Listing Policy | ChatList",
  alternates: { canonical: "/policies" },
  robots: { index: false, follow: true },
};

export default function PoliciesPage() {
  return (
    <UnderConstruction
      title="Our listing policy is being written up"
      description="What's allowed, how moderation and link verification work, and how to report a listing — coming soon."
    />
  );
}
