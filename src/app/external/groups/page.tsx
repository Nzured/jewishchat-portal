"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GroupCard } from "@/app/external/groups/_components/GroupCard";
import { ConversationalSearchBar } from "@/components/ui/ConversationalSearchBar";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  EXTERNAL_GROUPS_PATH,
  SEARCH_AUTOCOMPLETE_DEBOUNCE_MS,
  SEARCH_AUTOCOMPLETE_MIN_LENGTH,
} from "@/configs/const";
import { LOCATION_COUNTRIES } from "@/configs/locations";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { takePendingGroupSearch } from "@/services/search/pendingGroupSearch";
import {
  SearchService,
  type SearchGroupResult,
  type SearchSuggestion,
} from "@/services/search/search.service";
import { Category } from "@/types/Category";
import type { FilterItem } from "@/types/Search";
import { useGroups } from "./_context/GroupsContext";

const SKELETON_COUNT = 9;

const COUNTRY_OPTIONS = LOCATION_COUNTRIES.map(({ name }) => ({ label: name, value: name }));

function GroupsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Skeleton key={index} className="h-[132px] rounded-2xl" />
      ))}
    </div>
  );
}

function GroupsDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchCategories } = useGroups();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const city = searchParams.get("city") ?? "";
  const country = searchParams.get("country") ?? "";

  const [value, setValue] = React.useState(query);
  const [groups, setGroups] = React.useState<SearchGroupResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [autoCompleteResults, setAutoCompleteResults] = React.useState<SearchSuggestion[]>([]);
  const loadedFilters = React.useRef<string | null>(null);
  const debouncedValue = useDebouncedValue(value, SEARCH_AUTOCOMPLETE_DEBOUNCE_MS);

  React.useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [fetchCategories]);

  React.useEffect(() => {
    const prefix = debouncedValue.trim();
    if (prefix.length < SEARCH_AUTOCOMPLETE_MIN_LENGTH) return;

    let ignore = false;

    SearchService.autoComplete(prefix)
      .then((res) => {
        if (!ignore) setAutoCompleteResults(res?.data ?? []);
      })
      .catch(() => {
        if (!ignore) setAutoCompleteResults([]);
      });

    return () => {
      ignore = true;
    };
  }, [debouncedValue]);

  // Stale results from a longer prefix shouldn't linger once the box is
  // cleared back down below the threshold.
  const suggestedTerms =
    debouncedValue.trim().length >= SEARCH_AUTOCOMPLETE_MIN_LENGTH ? autoCompleteResults : [];

  React.useEffect(() => {
    const key = `${query}|${category}|${city}|${country}`;
    if (loadedFilters.current === key) return;
    loadedFilters.current = key;

    setValue(query);
    setIsLoading(true);
    const request =
      (!category && !city && !country && takePendingGroupSearch(query)) ||
      SearchService.searchGroups(query, category, city, country);

    request
      .then((res) => {
        if (loadedFilters.current !== key) return;
        setGroups(res?.data?.results ?? []);
        setIsLoading(false);
      })
      .catch(() => {
        if (loadedFilters.current !== key) return;
        setGroups([]);
        setIsLoading(false);
      });
  }, [query, category, city, country]);

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    const qs = params.toString();
    router.replace(`${EXTERNAL_GROUPS_PATH}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const filters: FilterItem[] = [
    {
      key: "category",
      label: "Category",
      component: "DROPDOWN",
      value: category || null,
      options: categories.map((item) => ({ label: item.name, value: item.slug })),
    },
    {
      key: "city",
      label: "City",
      component: "TEXT_INPUT",
      value: city || null,
    },
    {
      key: "country",
      label: "Country",
      component: "DROPDOWN",
      value: country || null,
      options: COUNTRY_OPTIONS,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ConversationalSearchBar
        className="w-full"
        compact
        placeholder="Look for your ideal group here..."
        value={value}
        onValueChange={setValue}
        loading={isLoading}
        autoCompleteSuggestions={suggestedTerms.map((item) => item.term)}
        filters={filters}
        onFilterApply={(key, newValue) => {
          const flatValue = Array.isArray(newValue) ? newValue[0] : newValue;
          updateSearchParams({ [key]: flatValue ?? undefined });
        }}
        onFilterClear={(key) => updateSearchParams({ [key]: undefined })}
        onSubmit={(search) => {
          updateSearchParams({ q: search });
        }}
      />

      {isLoading ? (
        <GroupsGridSkeleton />
      ) : groups.length === 0 ? (
        <NoData description="Try a different search or check back soon." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.uuid} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Groups() {
  return (
    <React.Suspense fallback={<GroupsGridSkeleton />}>
      <GroupsDirectory />
    </React.Suspense>
  );
}
