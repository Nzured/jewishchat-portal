"use client";

import { Link } from "@/components/ui/Link";
import { FeaturedGroups } from "./FeaturedGroups";
import { Header } from "./Header";
import { useHome } from "../_context/HomeContext";

export function FeaturedGroupsSection() {
  const { groups, isLoading } = useHome();

  if (!isLoading && groups.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <Header
        tags={["FEATURED ENGAGEMENT-RANKED"]}
        title="Groups the community is in right now. "
        description={
          "The most active and engaged WhatsApp communities this week, hand-checked by our team"
        }
        action={<Link href={"/internal/chat"}>See all</Link>}
      />
      <FeaturedGroups />
    </section>
  );
}
