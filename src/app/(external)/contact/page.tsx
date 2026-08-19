import { UnderConstruction } from "@/components/ui/UnderConstruction";
import type { Metadata } from "next";

// FR-SEO-CAN-03 — noindex until there's real content here (Priority 11).
export const metadata: Metadata = {
  title: "Contact | ChatList",
  alternates: { canonical: "/contact" },
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <UnderConstruction
      title="A real way to reach us is coming"
      description="We're setting up a proper contact channel. Check back soon."
    />
  );
}
