import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | ChatList",
  alternates: { canonical: "/about" },
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return (
    <ComingSoon
      title="Our story is on its way"
      description="We're still writing up who runs ChatList and why. Check back soon."
    />
  );
}
