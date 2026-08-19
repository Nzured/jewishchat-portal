import { EXTERNAL_GROUPS_PATH } from "@/configs/const";

interface GroupPathInput {
  slug: string;
  mainCategory?: { slug: string } | null;
  mainCategorySlug?: string;
}

/** Public category URL: `/{category-slug}` (FR-SEO-URL-01/02) — not `/categories/{slug}`. */
export function getCategoryPath(categorySlug: string): string {
  return `/${encodeURIComponent(categorySlug)}`;
}

/**
 * Public group detail URL: `/{category-slug}/{group-slug}` (FR-SEO-URL-01).
 * Falls back to the groups directory rather than build a URL that can't
 * resolve if a category slug isn't available.
 */
export function getGroupPath(group: GroupPathInput): string {
  const categorySlug = group.mainCategory?.slug ?? group.mainCategorySlug;
  return categorySlug
    ? `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(group.slug)}`
    : EXTERNAL_GROUPS_PATH;
}
