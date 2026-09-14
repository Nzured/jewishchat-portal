import { GROUP_SERVICE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import { serverGet } from "../serverFetch";

export interface SeoRedirectLookup {
  found: boolean;
  canonicalPath: string | null;
}
export interface SeoIndexableCheck {
  categorySlug: string;
  indexable: boolean;
}

const SEO_REVALIDATE_SECONDS = 300;
const SEO_CACHE_TAG = "seo";

const unwrap = <T extends object>(res: T | ApiResponse<T>): T => ("data" in res ? res.data : res);

export async function resolveSeoRedirect(path: string): Promise<string | null> {
  try {
    const res = await serverGet<SeoRedirectLookup | ApiResponse<SeoRedirectLookup>>(
      `${GROUP_SERVICE}seo/redirect`,
      { params: { path }, revalidate: SEO_REVALIDATE_SECONDS, tags: [SEO_CACHE_TAG] },
    );
    const result = unwrap(res);
    return result.found && result.canonicalPath ? result.canonicalPath : null;
  } catch {
    return null;
  }
}

export async function isCategoryIndexable(categorySlug: string): Promise<boolean> {
  try {
    const res = await serverGet<SeoIndexableCheck | ApiResponse<SeoIndexableCheck>>(
      `${GROUP_SERVICE}seo/categories/${encodeURIComponent(categorySlug)}/indexable`,
      { revalidate: SEO_REVALIDATE_SECONDS, tags: [SEO_CACHE_TAG] },
    );
    return Boolean(unwrap(res).indexable);
  } catch {
    return false;
  }
}
