"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ConversationalSearchBar } from "@/components/ui/ConversationalSearchBar";
import { EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { SEARCH_SUGGESTIONS } from "@/configs/searchSuggestions";
import { useUser } from "@/contexts/UserContext";
import { startGroupSearch } from "@/services/search/pendingGroupSearch";

const SUGGESTION_COUNT = 3;

function pickRandom<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

export function HomeSearchBar() {
  const router = useRouter();
  const { user } = useUser();
  const [value, setValue] = React.useState("");

  const suggestions = React.useMemo(() => {
    return user
      ? pickRandom(SEARCH_SUGGESTIONS, SUGGESTION_COUNT)
      : SEARCH_SUGGESTIONS.slice(0, SUGGESTION_COUNT);
  }, [user]);

  // Warm the groups route so submitting doesn't also pay for the bundle: the
  // only thing left to wait on is the search request itself.
  React.useEffect(() => {
    router.prefetch(EXTERNAL_GROUPS_PATH);
  }, [router]);

  return (
    <ConversationalSearchBar
      className="w-full max-w-3xl"
      value={value}
      onValueChange={setValue}
      onSubmit={(query) => {
        setValue(query);
        // Order matters: the request goes out first so it runs *during* the
        // route transition, and the groups page adopts it on mount.
        startGroupSearch(query);
        router.push(`${EXTERNAL_GROUPS_PATH}?q=${encodeURIComponent(query)}`);
      }}
      suggestions={suggestions}
      onSuggestionSelect={setValue}
    />
  );
}
