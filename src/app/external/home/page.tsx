import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_NEW_PATH } from "@/configs/const";
import { CategoriesSection } from "./_components/CategoriesSection";
import { FeaturedGroupsSection } from "./_components/FeaturedGroupsSection";
import { Header } from "./_components/Header";
import { HomeSearchBar } from "./_components/HomeSearchBar";

export default function InternalHomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <div className="mx-auto flex max-w-3xl flex-col items-start justify-center gap-4 text-left sm:items-center sm:text-center">
        <Typography
          variant="small"
          className="font-mono font-medium tracking-[2px] text-brand-green"
        >
          THE JEWISH COMMUNITY GROUP DIRECTORY
        </Typography>
        <Typography variant="title">
          Find the right WhatsApp group{" "}
          <span className="font-accent font-normal tracking-normal text-brand-green italic">
            in seconds
          </span>
        </Typography>
        <Typography variant={"h3"} className="max-w-xl font-medium text-ink-3">
          Over 2,400 verified WhatsApp groups for Torah study, business networking, kosher food,
          parenting and community events. Join in one tap.
        </Typography>
        <HomeSearchBar />
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
