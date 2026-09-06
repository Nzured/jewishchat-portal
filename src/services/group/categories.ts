import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Category } from "@/types/Category";
import { GroupService } from "./group.service";

export const CATEGORIES_CACHE_TAG = "categories";

const CATEGORIES_REVALIDATE_SECONDS = 3600;

const loadCategories = unstable_cache(
  async () => {
    const res = await GroupService.getCategories();
    return res.data ?? [];
  },
  ["external-categories"],
  { revalidate: CATEGORIES_REVALIDATE_SECONDS, tags: [CATEGORIES_CACHE_TAG] },
);

export const getCachedCategories = cache(async (): Promise<Category[]> => {
  try {
    return await loadCategories();
  } catch {
    return [];
  }
});
