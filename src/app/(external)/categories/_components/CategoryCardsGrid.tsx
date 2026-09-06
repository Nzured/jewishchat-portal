"use client";

import { useReveal } from "@/lib/motion/useReveal";
import { Category } from "@/types/Category";
import { CategoryListCard } from "./CategoryListCard";

export function CategoryCardsGrid({ categories }: { categories: Category[] }) {
  const gridRef = useReveal<HTMLDivElement>({ selector: ":scope > *", y: 24, stagger: 0.045 });

  return (
    <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
