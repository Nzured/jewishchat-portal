import { UnderConstruction } from "@/components/ui/UnderConstruction";
import type { Metadata } from "next";

// FR-SEO-CAN-03 — noindex until there's real content here (Priority 11).
export const metadata: Metadata = {
  title: "About | ChatList",
  alternates: { canonical: "/about" },
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return (
    <UnderConstruction
      title="Our story is on its way"
      description="We're still writing up who runs ChatList and why. Check back soon."
    />
  );
}
