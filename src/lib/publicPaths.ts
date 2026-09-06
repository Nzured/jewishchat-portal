import { EXTERNAL_GROUPS_MINE_PATH, EXTERNAL_GROUPS_PATH } from "@/configs/const";

interface GroupPathInput {
  slug: string;
  mainCategory?: { slug: string } | null;
  mainCategorySlug?: string;
}

export function getCategoryPath(categorySlug: string): string {
  return `/${encodeURIComponent(categorySlug)}`;
}

export function getGroupPath(group: GroupPathInput): string {
  const categorySlug = group.mainCategory?.slug ?? group.mainCategorySlug;
  return categorySlug
    ? `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(group.slug)}`
    : EXTERNAL_GROUPS_PATH;
}
export function getGroupEditPath(group: GroupPathInput): string {
  const categorySlug = group.mainCategory?.slug ?? group.mainCategorySlug;
  return categorySlug
    ? `${EXTERNAL_GROUPS_MINE_PATH}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(group.slug)}`
    : EXTERNAL_GROUPS_MINE_PATH;
}
