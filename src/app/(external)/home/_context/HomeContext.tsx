"use client";

import * as React from "react";
import { GroupService } from "@/services/group/group.service";
import { Category } from "@/types/Category";
import { Group, GroupStatus } from "@/types/Group";
import { PlatformStats } from "@/types/Stats";

interface HomeContextType {
  categories: Category[];
  isLoading: boolean;
  groups: Group[];
  stats: PlatformStats | null;
  countries: string[];
}

const HomeContext = React.createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [stats, setStats] = React.useState<PlatformStats | null>(null);
  const [countries, setCountries] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function fetchHomeData() {
      const [groupRes, categoriesRes, statsRes, countriesRes] = await Promise.allSettled([
        GroupService.getAllGroups("", "", "", 0, 5),
        GroupService.getCategories(),
        GroupService.getPlatformStats(),
        GroupService.getActiveCountries(),
      ]);

      if (ignore) return;

      setGroups(
        groupRes.status === "fulfilled"
          ? (groupRes.value?.data?.groups || []).filter((g) => g.status === GroupStatus.ACTIVE)
          : [],
      );
      setCategories(categoriesRes.status === "fulfilled" ? categoriesRes.value?.data || [] : []);
      setStats(statsRes.status === "fulfilled" ? statsRes.value?.data || null : null);
      setCountries(
        countriesRes.status === "fulfilled" ? countriesRes.value?.data?.countries || [] : [],
      );
      setIsLoading(false);
    }

    void fetchHomeData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <HomeContext.Provider
      value={{
        categories,
        isLoading,
        groups,
        stats,
        countries,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export function useHome() {
  const context = React.useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}
