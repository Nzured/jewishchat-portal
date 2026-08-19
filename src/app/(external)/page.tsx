import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { CANONICAL_SITE_URL, EXTERNAL_GROUPS_NEW_PATH, EXTERNAL_HOME_PATH } from "@/configs/const";
import { CategoriesSection } from "./home/_components/CategoriesSection";
import { FeaturedGroupsSection } from "./home/_components/FeaturedGroupsSection";
import { Header } from "./home/_components/Header";
import { Hero } from "./home/_components/Hero";
import { HomeProvider } from "./home/_context/HomeContext";
import type { Metadata } from "next";

const TITLE = "ChatList — Find Jewish Community WhatsApp Groups";
const DESCRIPTION =
  "Discover and join WhatsApp groups for Jewish businesses, organizations, and communities.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: EXTERNAL_HOME_PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: EXTERNAL_HOME_PATH,
    type: "website",
    images: [{ url: `${CANONICAL_SITE_URL}/svgs/logo.svg` }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${CANONICAL_SITE_URL}/svgs/logo.svg`],
  },
};

export default function HomePage() {
  return (
    <HomeProvider>
      <div className="flex flex-col gap-16 pb-16">
        <div className="-mx-4 -mt-8 md:-mx-8">
          <Hero />
        </div>

        <FeaturedGroupsSection />

        <CategoriesSection />

        <Header
          tags={["FOR GROUP ADMINS"]}
          title="Run a group?
List it in seconds."
          description={
            "Free for community groups. AI-moderated, reviewed by a human, and live within 24 hours. No ads. No data resale. Just discovery."
          }
          action={
            <Button rightIcon={<ArrowRight />} asChild>
              <NextLink href={EXTERNAL_GROUPS_NEW_PATH}>Submit Group</NextLink>
            </Button>
          }
        />
      </div>
    </HomeProvider>
  );
}
