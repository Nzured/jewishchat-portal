import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, GROUP_SERVICE } from "@/configs/const";
import { Category, CategoryDetail } from "@/types/Category";
import { ApiResponse } from "@/types/Common";
import { Group, GroupsPage } from "@/types/Group";
import { ActiveCountries, PlatformStats } from "@/types/Stats";
import { serverGet } from "../serverFetch";

export const CACHE_TAGS = {
  categories: "categories",
  groups: "groups",
  stats: "stats",
} as const;

export const CATEGORIES_REVALIDATE_SECONDS = 3600;
export const GROUPS_REVALIDATE_SECONDS = 300;
export const STATS_REVALIDATE_SECONDS = 600;

interface GroupListQuery {
  category?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const GroupServer = {
  getCategories: () =>
    serverGet<ApiResponse<Category[]>>(`${GROUP_SERVICE}groups/categories`, {
      revalidate: CATEGORIES_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.categories],
    }),
  getCategoryBySlug: (slug: string) =>
    serverGet<ApiResponse<CategoryDetail>>(
      `${GROUP_SERVICE}groups/categories/${encodeURIComponent(slug)}`,
      { revalidate: GROUPS_REVALIDATE_SECONDS, tags: [CACHE_TAGS.categories] },
    ),
  getGroups: ({
    category,
    page = DEFAULT_PAGE,
    size = DEFAULT_PAGE_SIZE,
    sort = "totalViews,desc",
  }: GroupListQuery = {}) =>
    serverGet<ApiResponse<GroupsPage>>(`${GROUP_SERVICE}groups`, {
      params: { category, page, size, sort },
      revalidate: GROUPS_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.groups],
    }),
  getGroupByCategoryAndSlug: (categorySlug: string, groupSlug: string) =>
    serverGet<ApiResponse<Group>>(
      `${GROUP_SERVICE}groups/${encodeURIComponent(categorySlug)}/${encodeURIComponent(groupSlug)}`,
      { revalidate: GROUPS_REVALIDATE_SECONDS, tags: [CACHE_TAGS.groups] },
    ),
  getRelatedGroups: (uuid: string) =>
    serverGet<ApiResponse<Group[]>>(`${GROUP_SERVICE}groups/by-uuid/${uuid}/related`, {
      revalidate: GROUPS_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.groups],
    }),
  getPlatformStats: () =>
    serverGet<ApiResponse<PlatformStats>>(`${GROUP_SERVICE}groups/stats`, {
      revalidate: STATS_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.stats],
    }),
  getActiveCountries: () =>
    serverGet<ApiResponse<ActiveCountries>>(`${GROUP_SERVICE}groups/stats/active-countries`, {
      revalidate: STATS_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.stats],
    }),
};
