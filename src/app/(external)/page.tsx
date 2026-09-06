import { GradientBackdrop } from "@/components/ui/Aurora";
import {
  CANONICAL_SITE_URL,
  EXTERNAL_HOME_PATH,
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_TITLE,
} from "@/configs/const";
import { CategoriesSection } from "./home/_components/CategoriesSection";
import { CountryStrip } from "./home/_components/CountryStrip";
import { Faq } from "./home/_components/Faq";
import { FeaturedGroupsSection } from "./home/_components/FeaturedGroupsSection";
import { Hero } from "./home/_components/Hero";
import { HowItWorks } from "./home/_components/HowItWorks";
import { StatBand } from "./home/_components/StatBand";
import { TrustSafety } from "./home/_components/TrustSafety";
import { HomeProvider } from "./home/_context/HomeContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: HOME_PAGE_TITLE,
  description: HOME_PAGE_DESCRIPTION,
  alternates: { canonical: EXTERNAL_HOME_PATH },
  openGraph: {
    title: HOME_PAGE_TITLE,
    description: HOME_PAGE_DESCRIPTION,
    url: EXTERNAL_HOME_PATH,
    type: "website",
    images: [{ url: `${CANONICAL_SITE_URL}/svgs/logo.svg` }],
  },
  twitter: {
    card: "summary",
    title: HOME_PAGE_TITLE,
    description: HOME_PAGE_DESCRIPTION,
    images: [`${CANONICAL_SITE_URL}/svgs/logo.svg`],
  },
};

export default function HomePage() {
  return (
    <HomeProvider>
      <GradientBackdrop />
      <div className="space-y-16 pb-16">
        <div className="-mx-4 -mt-8 md:-mx-8">
          <Hero />
        </div>

        <div className="-mx-4 md:-mx-8">
          <StatBand />
        </div>

        <FeaturedGroupsSection />

        <CategoriesSection />

        <CountryStrip />

        <HowItWorks />

        <TrustSafety />

        <Faq />
      </div>
    </HomeProvider>
  );
}
