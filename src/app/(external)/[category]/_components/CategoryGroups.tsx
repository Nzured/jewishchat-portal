"use client";

import * as React from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NoData } from "@/components/ui/NoData";
import { SearchFilterChip } from "@/components/ui/SearchFilterChip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { DEFAULT_PAGE } from "@/configs/const";
import { LOCATION_COUNTRIES } from "@/configs/locations";
import { GroupService } from "@/services/group/group.service";
import { Group } from "@/types/Group";
import type { FilterItem } from "@/types/Search";
import { CategoryGroupCard } from "./CategoryGroupCard";
import {
  CATEGORY_GROUPS_DEFAULT_SORT,
  CATEGORY_GROUPS_PAGE_SIZE,
  CATEGORY_GROUPS_SORT_OPTIONS,
} from "./groupsListing";

const PAGE_SIZE = CATEGORY_GROUPS_PAGE_SIZE;
const ANY_LOCATION = "";
const SORT_OPTIONS = CATEGORY_GROUPS_SORT_OPTIONS;

const LOCATION_OPTIONS = LOCATION_COUNTRIES.map(({ name }) => ({ label: name, value: name }));

interface CategoryGroupsProps {
  categorySlug: string;
  initialGroups: Group[];
  initialTotal: number;
}

function GroupsSkeleton({ count = PAGE_SIZE }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-44 rounded-2xl" />
      ))}
    </div>
  );
}

export function CategoryGroups({ categorySlug, initialGroups, initialTotal }: CategoryGroupsProps) {
  const [location, setLocation] = React.useState(ANY_LOCATION);
  const [sort, setSort] = React.useState(CATEGORY_GROUPS_DEFAULT_SORT);
  const [groups, setGroups] = React.useState(initialGroups);
  const [total, setTotal] = React.useState(initialTotal);
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const filterKey = `${categorySlug}|${location}|${sort}`;
  const loadedKey = React.useRef(filterKey);
  const hasMore = groups.length < total;

  React.useEffect(() => {
    if (loadedKey.current === filterKey) return;
    loadedKey.current = filterKey;

    let ignore = false;
    setIsLoading(true);

    GroupService.getAllGroups(
      undefined,
      location === ANY_LOCATION ? undefined : location,
      categorySlug,
      DEFAULT_PAGE,
      PAGE_SIZE,
      sort,
    )
      .then((res) => {
        if (ignore) return;
        setGroups(res?.data?.groups ?? []);
        setTotal(res?.data?.totalElements ?? 0);
        setPage(DEFAULT_PAGE);
      })
      .catch(() => {
        if (ignore) return;
        setGroups([]);
        setTotal(0);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filterKey, categorySlug, location, sort]);

  const locationFilter: FilterItem = {
    key: "location",
    label: "Location",
    component: "DROPDOWN",
    value: location || null,
    options: LOCATION_OPTIONS,
  };

  const loadMore = () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);

    GroupService.getAllGroups(
      undefined,
      location === ANY_LOCATION ? undefined : location,
      categorySlug,
      nextPage,
      PAGE_SIZE,
      sort,
    )
      .then((res) => {
        const incoming = res?.data?.groups ?? [];
        setGroups((prev) => {
          const seen = new Set(prev.map((group) => group.uuid));
          return [...prev, ...incoming.filter((group) => !seen.has(group.uuid))];
        });
        setTotal(res?.data?.totalElements ?? 0);
        setPage(nextPage);
      })
      .catch(() => undefined)
      .finally(() => setIsLoadingMore(false));
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <SearchFilterChip
          filter={locationFilter}
          onApply={(value) =>
            setLocation((Array.isArray(value) ? value[0] : value) ?? ANY_LOCATION)
          }
          onClear={() => setLocation(ANY_LOCATION)}
        />

        <Typography as="span" variant="xs" className="text-ink-4">
          {isLoading
            ? "Loading groups..."
            : `Showing ${groups.length.toLocaleString()} of ${total.toLocaleString()} ${total === 1 ? "group" : "groups"}`}
        </Typography>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger size="sm" className="ml-auto">
            <ArrowUpDown className="size-3.5 text-ink-3" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <GroupsSkeleton />
      ) : groups.length === 0 ? (
        <NoData
          title="No groups here yet"
          description={
            location === ANY_LOCATION
              ? "Nothing has been listed in this category so far."
              : "No groups in this category for that location yet."
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <CategoryGroupCard key={group.uuid} group={group} />
            ))}
          </div>

          {isLoadingMore && <GroupsSkeleton count={3} />}

          {hasMore && (
            <Button
              variant="outline"
              className="self-center"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Load more groups"}
            </Button>
          )}
        </>
      )}
    </section>
  );
}
