import { cache } from "react";
import { Category } from "@/types/Category";
import { CACHE_TAGS, GroupServer } from "./group.server";

export const CATEGORIES_CACHE_TAG = CACHE_TAGS.categories;

export const getCachedCategories = cache(async (): Promise<Category[]> => {
  try {
    const res = await GroupServer.getCategories();
    return res.data ?? [];
  } catch {
    return [];
  }
});
