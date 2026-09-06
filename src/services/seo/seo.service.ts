import { GROUP_SERVICE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import api from "../axiosConfig";

export interface SeoRedirectLookup {
  found: boolean;
  canonicalPath: string | null;
}
export interface SeoIndexableCheck {
  categorySlug: string;
  indexable: boolean;
}

export const SeoService = {
  lookupRedirect: (path: string) =>
    api.get<SeoRedirectLookup | ApiResponse<SeoRedirectLookup>>(`${GROUP_SERVICE}seo/redirect`, {
      params: { path },
    }),
  checkCategoryIndexable: (categorySlug: string) =>
    api.get<SeoIndexableCheck | ApiResponse<SeoIndexableCheck>>(
      `${GROUP_SERVICE}seo/categories/${encodeURIComponent(categorySlug)}/indexable`,
    ),
};

export async function resolveSeoRedirect(path: string): Promise<string | null> {
  try {
    const res = await SeoService.lookupRedirect(path);
    const result = "data" in res ? res.data : res;
    return result.found && result.canonicalPath ? result.canonicalPath : null;
  } catch {
    return null;
  }
}

export async function isCategoryIndexable(categorySlug: string): Promise<boolean> {
  try {
    const res = await SeoService.checkCategoryIndexable(categorySlug);
    const result = "data" in res ? res.data : res;
    return Boolean(result.indexable);
  } catch {
    return false;
  }
}
