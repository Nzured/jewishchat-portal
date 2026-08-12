"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useReveal } from "@/lib/motion/useReveal";
import { Category as CategoryType } from "@/types/Category";
import { Category } from "./Category";
import { useHome } from "../_context/HomeContext";

const MAX_VISIBLE_CATEGORIES = 12;

function CategoriesRevealGrid({ categories }: { categories: CategoryType[] }) {
  const gridRef = useReveal<HTMLDivElement>({ selector: ":scope > *", y: 28, stagger: 0.045 });

  return (
    <div
      ref={gridRef}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:pb-8 lg:[&>*:nth-child(4n+2)]:top-8 lg:[&>*:nth-child(4n+4)]:top-8"
    >
      {categories.map((category) => (
        <Category
          key={category.id}
          name={category.name}
          slug={category.slug}
          icon={category.icon}
          description={category.description}
          count={category.groupsCount}
          color={category.color}
        />
      ))}
    </div>
  );
}

export function CategoriesGrid() {
  const { categories, isLoading } = useHome();
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: MAX_VISIBLE_CATEGORIES }).map((_, index) => (
          <Skeleton key={index} className="h-[212px] rounded-[22px]" />
        ))}
      </div>
    );
  }

  return <CategoriesRevealGrid categories={visibleCategories} />;
}
