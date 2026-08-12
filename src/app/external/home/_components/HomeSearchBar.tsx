"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ConversationalSearchBar } from "@/components/ui/ConversationalSearchBar";
import { EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { SEARCH_SUGGESTIONS } from "@/configs/searchSuggestions";
import { useUser } from "@/contexts/UserContext";
import { startGroupSearch } from "@/services/search/pendingGroupSearch";
import { useHeroSearch } from "../_context/HeroSearchContext";

const SUGGESTION_COUNT = 3;

function pickRandom<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

export function HomeSearchBar() {
  const router = useRouter();
  const { user } = useUser();
  const [value, setValue] = React.useState("");

  const heroSearch = useHeroSearch();
  const publishQuery = heroSearch?.setQuery;

  const handleValueChange = React.useCallback(
    (next: string) => {
      setValue(next);
      publishQuery?.(next);
    },
    [publishQuery],
  );

  const suggestions = React.useMemo(() => {
    return user
      ? pickRandom(SEARCH_SUGGESTIONS, SUGGESTION_COUNT)
      : SEARCH_SUGGESTIONS.slice(0, SUGGESTION_COUNT);
  }, [user]);

  React.useEffect(() => {
    router.prefetch(EXTERNAL_GROUPS_PATH);
  }, [router]);

  return (
    <ConversationalSearchBar
      className="w-full max-w-3xl"
      value={value}
      onValueChange={handleValueChange}
      onSubmit={(query) => {
        handleValueChange(query);
        startGroupSearch(query);
        router.push(`${EXTERNAL_GROUPS_PATH}?q=${encodeURIComponent(query)}`);
      }}
      suggestions={suggestions}
      onSuggestionSelect={handleValueChange}
    />
  );
}
