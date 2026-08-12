"use client";

import * as React from "react";
import { DEFAULT_PAGE } from "@/configs/const";
import { SearchService, type SearchGroupResult } from "@/services/search/search.service";

const DEBOUNCE_MS = 550;

const PREVIEW_SIZE = 3;

const NO_RESULTS: SearchGroupResult[] = [];

interface HeroSearchContextValue {
  query: string;
  setQuery: (query: string) => void;

  results: SearchGroupResult[];

  totalResults: number;

  isSearching: boolean;
}

type Settled = {
  query: string;
  results: SearchGroupResult[];
  totalResults: number;
};

const HeroSearchContext = React.createContext<HeroSearchContextValue | null>(null);

export function HeroSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = React.useState("");
  const [settled, setSettled] = React.useState<Settled>({
    query: "",
    results: NO_RESULTS,
    totalResults: 0,
  });

  const requestSeq = React.useRef(0);

  const trimmed = query.trim();

  const isCurrent = settled.query === trimmed;
  const results = isCurrent ? settled.results : NO_RESULTS;
  const totalResults = isCurrent ? settled.totalResults : 0;
  const isSearching = trimmed !== "" && !isCurrent;

  React.useEffect(() => {
    const q = query.trim();

    if (!q) {
      requestSeq.current += 1;
      return;
    }

    const timer = window.setTimeout(() => {
      const seq = (requestSeq.current += 1);

      void (async () => {
        try {
          const res = await SearchService.searchGroups(q, "", "", "", DEFAULT_PAGE, PREVIEW_SIZE);
          if (seq !== requestSeq.current) return;

          setSettled({
            query: q,
            results: res?.data?.results ?? NO_RESULTS,
            totalResults: res?.data?.totalResults ?? 0,
          });
        } catch {
          if (seq !== requestSeq.current) return;
          setSettled({ query: q, results: NO_RESULTS, totalResults: 0 });
        }
      })();
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  const value = React.useMemo<HeroSearchContextValue>(
    () => ({ query, setQuery, results, totalResults, isSearching }),
    [query, results, totalResults, isSearching],
  );

  return <HeroSearchContext.Provider value={value}>{children}</HeroSearchContext.Provider>;
}

export function useHeroSearch(): HeroSearchContextValue | null {
  return React.useContext(HeroSearchContext);
}
