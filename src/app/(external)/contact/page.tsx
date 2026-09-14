import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | ChatList",
  alternates: { canonical: "/contact" },
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <ComingSoon
      title="A real way to reach us is coming"
      description="We're setting up a proper contact channel. Check back soon."
    />
  );
}
