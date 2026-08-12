import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { EXTERNAL_GROUPS_NEW_PATH } from "@/configs/const";
import { CategoriesSection } from "./_components/CategoriesSection";
import { FeaturedGroupsSection } from "./_components/FeaturedGroupsSection";
import { Header } from "./_components/Header";
import { Hero } from "./_components/Hero";

export default function InternalHomePage() {
  return (
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
  );
}
