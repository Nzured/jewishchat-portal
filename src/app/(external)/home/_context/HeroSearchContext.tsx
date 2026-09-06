"use client";

import * as React from "react";
import { DEFAULT_PAGE, HERO_SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from "@/configs/const";
import { SearchService, type SearchGroupResult } from "@/services/search/search.service";

const PREVIEW_SIZE = 3;

const NO_RESULTS: SearchGroupResult[] = [];

interface HeroSearchContextValue {
  query: string;
  setQuery: (query: string) => void;

  results: SearchGroupResult[];

  totalResults: number;

  searchId?: string;

  isSearching: boolean;
}

type Settled = {
  query: string;
  results: SearchGroupResult[];
  totalResults: number;
  searchId?: string;
};

const HeroSearchContext = React.createContext<HeroSearchContextValue | null>(null);

export function HeroSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [settled, setSettled] = React.useState<Settled>({
    query: "",
    results: NO_RESULTS,
    totalResults: 0,
  });

  const requestSeq = React.useRef(0);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), HERO_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const trimmed = debouncedQuery.trim();

  const isSearchable = trimmed.length >= SEARCH_MIN_LENGTH;
  const isCurrent = settled.query === trimmed;
  const results = isCurrent ? settled.results : NO_RESULTS;
  const totalResults = isCurrent ? settled.totalResults : 0;
  const searchId = isCurrent ? settled.searchId : undefined;
  const isSearching = isSearchable && !isCurrent;

  React.useEffect(() => {
    if (!isSearchable) {
      requestSeq.current += 1;
      return;
    }

    const seq = (requestSeq.current += 1);

    void (async () => {
      try {
        const res = await SearchService.searchGroups(
          trimmed,
          "",
          "",
          "",
          DEFAULT_PAGE,
          PREVIEW_SIZE,
        );
        if (seq !== requestSeq.current) return;

        setSettled({
          query: trimmed,
          results: res?.data?.results ?? NO_RESULTS,
          totalResults: res?.data?.totalResults ?? 0,
          searchId: res?.data?.searchId,
        });
      } catch {
        if (seq !== requestSeq.current) return;
        setSettled({ query: trimmed, results: NO_RESULTS, totalResults: 0 });
      }
    })();
  }, [trimmed, isSearchable]);

  const value = React.useMemo<HeroSearchContextValue>(
    () => ({ query: debouncedQuery, setQuery, results, totalResults, searchId, isSearching }),
    [debouncedQuery, results, totalResults, searchId, isSearching],
  );

  return <HeroSearchContext.Provider value={value}>{children}</HeroSearchContext.Provider>;
}

export function useHeroSearch(): HeroSearchContextValue | null {
  return React.useContext(HeroSearchContext);
}
