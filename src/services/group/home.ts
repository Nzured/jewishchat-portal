import { cache } from "react";
import { Category } from "@/types/Category";
import { Group, GroupStatus } from "@/types/Group";
import { PlatformStats } from "@/types/Stats";
import { getCachedCategories } from "./categories";
import { GroupServer } from "./group.server";

const FEATURED_GROUPS_COUNT = 5;

export interface HomeData {
  categories: Category[];
  groups: Group[];
  stats: PlatformStats | null;
  countries: string[];
}

const settled = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
  result.status === "fulfilled" ? result.value : fallback;

export const getCachedHomeData = cache(async (): Promise<HomeData> => {
  const [groups, categories, stats, countries] = await Promise.allSettled([
    GroupServer.getGroups({ size: FEATURED_GROUPS_COUNT }).then((res) =>
      (res.data?.groups ?? []).filter((group) => group.status === GroupStatus.ACTIVE),
    ),
    getCachedCategories(),
    GroupServer.getPlatformStats().then((res) => res.data ?? null),
    GroupServer.getActiveCountries().then((res) => res.data?.countries ?? []),
  ]);

  return {
    groups: settled(groups, []),
    categories: settled(categories, []),
    stats: settled(stats, null),
    countries: settled(countries, []),
  };
});
