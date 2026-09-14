"use client";

import * as React from "react";
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
      className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto sm:grid sm:snap-none sm:overflow-visible sm:grid-cols-2 lg:grid-cols-4 lg:[&>*:nth-child(4n+2)]:top-8 lg:[&>*:nth-child(4n+4)]:top-8"
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
          className="w-[76vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none"
        />
      ))}
    </div>
  );
}

export function CategoriesGrid() {
  const { categories } = useHome();

  const visibleCategories = React.useMemo(() => {
    const described = (category: CategoryType) => (category.description?.trim() ? 0 : 1);
    return [...categories]
      .sort((a, b) => described(a) - described(b))
      .slice(0, MAX_VISIBLE_CATEGORIES);
  }, [categories]);

  return <CategoriesRevealGrid categories={visibleCategories} />;
}
