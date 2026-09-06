import { Header } from "@/app/(external)/home/_components/Header";
import { NoData } from "@/components/ui/NoData";
import { CANONICAL_SITE_URL, EXTERNAL_CATEGORIES_PATH } from "@/configs/const";
import { getCachedCategories } from "@/services/group/categories";
import { CategoryListCard } from "./_components/CategoryListCard";
import type { Metadata } from "next";

const TITLE = "All Categories | ChatList";
const DESCRIPTION = "Browse every active category of Jewish community WhatsApp groups on ChatList.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: EXTERNAL_CATEGORIES_PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: EXTERNAL_CATEGORIES_PATH,
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

export default async function CategoriesPage() {
  const categories = await getCachedCategories();

  return (
    <div className="flex flex-col gap-8">
      <Header
        tags={["Browse"]}
        title="Every corner of Jewish life."
        titleAs="h1"
        description="Pick a category to see every group listed under it."
      />

      {categories.length === 0 ? (
        <NoData
          title="No categories yet"
          description="Check back soon as new categories go live."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryListCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              icon={category.icon}
              description={category.description}
              color={category.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
