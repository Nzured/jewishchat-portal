"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GroupCard } from "@/app/(external)/groups/_components/GroupCard";
import { ConversationalSearchBar } from "@/components/ui/ConversationalSearchBar";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  EXTERNAL_GROUPS_PATH,
  SEARCH_MIN_LENGTH,
} from "@/configs/const";
import { LOCATION_COUNTRIES } from "@/configs/locations";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
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
const LOAD_MORE_SKELETON_COUNT = 3;
const CARD_WIDTH = "w-full sm:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.667rem)]";

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
  const [totalResults, setTotalResults] = React.useState(0);
  const [searchId, setSearchId] = React.useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [autoCompleteResults, setAutoCompleteResults] = React.useState<SearchSuggestion[]>([]);
  const loadedFilters = React.useRef<string | null>(null);
  const loadedPage = React.useRef(DEFAULT_PAGE);

  const gridRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const revealedCount = React.useRef(0);
  const reducedRef = React.useRef(false);

  const hasMore = groups.length < totalResults;

  React.useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [fetchCategories]);

  React.useEffect(() => {
    const prefix = value.trim();
    if (prefix.length < SEARCH_MIN_LENGTH) return;

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
  }, [value]);

  const suggestedTerms = value.trim().length >= SEARCH_MIN_LENGTH ? autoCompleteResults : [];

  React.useEffect(() => {
    const key = `${query}|${category}|${city}|${country}`;
    if (loadedFilters.current === key) return;
    loadedFilters.current = key;

    setValue(query);
    setIsLoading(true);
    loadedPage.current = DEFAULT_PAGE;
    revealedCount.current = 0;

    const request =
      (!category && !city && !country && takePendingGroupSearch(query)) ||
      SearchService.searchGroups(query, category, city, country, DEFAULT_PAGE, DEFAULT_PAGE_SIZE);

    request
      .then((res) => {
        if (loadedFilters.current !== key) return;
        setGroups(res?.data?.results ?? []);
        setTotalResults(res?.data?.totalResults ?? 0);
        setSearchId(res?.data?.searchId);
        setIsLoading(false);
      })
      .catch(() => {
        if (loadedFilters.current !== key) return;
        setGroups([]);
        setTotalResults(0);
        setSearchId(undefined);
        setIsLoading(false);
      });
  }, [query, category, city, country]);

  const loadMore = React.useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const key = loadedFilters.current;
    const nextPage = loadedPage.current + 1;
    setIsLoadingMore(true);

    SearchService.searchGroups(query, category, city, country, nextPage, DEFAULT_PAGE_SIZE)
      .then((res) => {
        if (loadedFilters.current !== key) return;
        loadedPage.current = nextPage;
        const incoming = res?.data?.results ?? [];
        setGroups((prev) => {
          const seen = new Set(prev.map((group) => group.uuid));
          return [...prev, ...incoming.filter((group) => !seen.has(group.uuid))];
        });
        setTotalResults(res?.data?.totalResults ?? 0);
        setSearchId(res?.data?.searchId);
        setIsLoadingMore(false);
      })
      .catch(() => {
        if (loadedFilters.current !== key) return;
        setIsLoadingMore(false);
      });
  }, [isLoading, isLoadingMore, hasMore, query, category, city, country]);

  const loadMoreRef = React.useRef(loadMore);
  React.useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [isLoading, hasMore, groups.length]);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        reducedRef.current = reduced;
      },
    );
    return () => mm.revert();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.children) as HTMLElement[];
    const fresh = cards.slice(revealedCount.current);
    if (fresh.length === 0) return;
    revealedCount.current = cards.length;

    if (reducedRef.current) {
      gsap.set(fresh, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      fresh,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" },
    );

    return () => {
      tween.kill();
    };
  }, [groups]);

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
        <>
          <div ref={gridRef} className="flex flex-wrap gap-4">
            {groups.map((group, index) => (
              <GroupCard
                key={group.uuid}
                group={group}
                className={CARD_WIDTH}
                search={{ searchId, query, position: index + 1 }}
              />
            ))}
          </div>

          {hasMore ? (
            <div ref={sentinelRef} className="flex min-h-px flex-wrap gap-4">
              {isLoadingMore
                ? Array.from({ length: LOAD_MORE_SKELETON_COUNT }).map((_, index) => (
                    <Skeleton key={index} className={`h-[132px] rounded-2xl ${CARD_WIDTH}`} />
                  ))
                : null}
            </div>
          ) : null}
        </>
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
