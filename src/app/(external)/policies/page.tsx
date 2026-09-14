import { ComingSoon } from "@/components/ui/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Listing Policy | ChatList",
  alternates: { canonical: "/policies" },
  robots: { index: false, follow: true },
};

export default function PoliciesPage() {
  return (
    <ComingSoon
      title="Our listing policy is being written up"
      description="What's allowed, how moderation and link verification work, and how to report a listing - coming soon."
    />
  );
}
