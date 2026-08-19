"use client";

import { Link } from "@/components/ui/Link";
import { EXTERNAL_CATEGORIES_PATH } from "@/configs/const";
import { CategoriesGrid } from "./CategoriesGrid";
import { Header } from "./Header";
import { useHome } from "../_context/HomeContext";

export function CategoriesSection() {
  const { categories, isLoading } = useHome();

  if (!isLoading && categories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="scroll-mt-20 flex flex-col gap-6">
      <Header
        tags={["Browse by topic"]}
        title="Every corner of the Jewish life"
        description={
          "From Daf Yomi to founders' circles to school carpool. Pick a category to explore."
        }
        action={<Link href={EXTERNAL_CATEGORIES_PATH}>See all</Link>}
      />
      <CategoriesGrid />
    </section>
  );
}
