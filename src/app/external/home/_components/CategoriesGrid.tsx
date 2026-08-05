"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { Category } from "./Category";
import { useHome } from "../_context/HomeContext";

const MAX_VISIBLE_CATEGORIES = 10;

export function CategoriesGrid() {
  const { categories, isLoading } = useHome();
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: MAX_VISIBLE_CATEGORIES }).map((_, index) => (
          <Skeleton key={index} className="h-[52px] rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visibleCategories.map((category, index) => (
        <Category
          key={category.id}
          number={String(index + 1).padStart(2, "0")}
          name={category.name}
          icon={category.icon}
          count={category.groupsCount ?? 0}
          color={category.color}
        />
      ))}
    </div>
  );
}
