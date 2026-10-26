import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import {
  EXTERNAL_GROUPS_MINE_PATH,
  EXTERNAL_GROUPS_PATH,
  EXTERNAL_HOME_PATH,
  EXTERNAL_PROFILE_PATH,
} from "@/configs/const";

interface GroupPathInput {
  slug: string;
  mainCategory?: { slug: string } | null;
  mainCategorySlug?: string;
}

interface ProfileOriginGroup extends GroupPathInput {
  name: string;
  mainCategory?: { slug: string; name?: string } | null;
}

const GROUP_PATH_PATTERN = /^\/[^/?#\\]+\/[^/?#\\]+$/;

export function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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

export function getMemberProfilePath(uuid: string, fromGroup?: ProfileOriginGroup): string {
  const path = `${EXTERNAL_PROFILE_PATH}/${encodeURIComponent(uuid)}`;
  if (!fromGroup) return path;

  const groupPath = getGroupPath(fromGroup);
  if (!GROUP_PATH_PATTERN.test(groupPath)) return path;

  const params = new URLSearchParams({ from: groupPath, group: fromGroup.name });
  if (fromGroup.mainCategory?.name) params.set("category", fromGroup.mainCategory.name);
  return `${path}?${params.toString()}`;
}

export function getMemberProfileCrumbs(
  memberName: string,
  params: Pick<URLSearchParams, "get">,
): BreadcrumbItem[] {
  const home = { label: "Home", href: EXTERNAL_HOME_PATH };
  const member = { label: memberName };
  const from = params.get("from");
  const groupName = params.get("group")?.trim();
  if (!from || !groupName || !GROUP_PATH_PATTERN.test(from)) return [home, member];

  const categoryName = params.get("category")?.trim();
  const categoryPath = from.slice(0, from.indexOf("/", 1));
  return [
    home,
    ...(categoryName ? [{ label: categoryName, href: categoryPath }] : []),
    { label: groupName, href: from },
    member,
  ];
}
