"use client";

import * as React from "react";
import { GroupService } from "@/services/group/group.service";
import { Category } from "@/types/Category";
import { Group, GroupStatus } from "@/types/Group";

interface HomeContextType {
  categories: Category[];
  isLoading: boolean;
  groups: Group[];
}

const HomeContext = React.createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function fetchHomeData() {
      try {
        const [groupRes, categoriesRes] = await Promise.all([
          GroupService.getAllGroups("", "", "", 0, 5),
          GroupService.getCategories(),
        ]);
        setCategories(categoriesRes?.data || []);
        setGroups((groupRes?.data?.groups || []).filter((g) => g.status === GroupStatus.ACTIVE));
      } catch {
        if (!ignore) {
          setCategories([]);
          setGroups([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
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
