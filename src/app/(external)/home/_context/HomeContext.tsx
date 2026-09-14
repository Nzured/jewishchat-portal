"use client";

import * as React from "react";
import type { HomeData } from "@/services/group/home";

const HomeContext = React.createContext<HomeData | undefined>(undefined);

export function HomeProvider({ data, children }: { data: HomeData; children: React.ReactNode }) {
  return <HomeContext.Provider value={data}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const context = React.useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}
