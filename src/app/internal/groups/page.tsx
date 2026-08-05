"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppHeader from "@/components/layout/app/AppHeader";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { FilterItem } from "@/types/Search";
import { GroupsTable, STATUS_FILTER_OPTIONS } from "./_components/GroupsTable";
import { useAdminGroupContext } from "./_context/AdminGroupContext";

const INITIAL_FILTERS: FilterItem[] = [
  {
    key: "groupName",
    label: "Group Name",
    component: "TEXT_INPUT",
    value: null,
  },
  {
    key: "category",
    label: "Category",
    component: "AUTOSELECT",
    value: null,
    options: [],
    searchValue: "",
  },
  {
    key: "status",
    label: "Status",
    component: "DROPDOWN",
    value: null,
    options: STATUS_FILTER_OPTIONS,
    searchValue: "",
  },
];

function ExternalGroupsContent() {
  const { filters, resetFilters, updateFilterOptions } = useSearchFilter();
  const { fetchCategories } = useAdminGroupContext();
  const [totalGroups, setTotalGroups] = useState(0);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  useEffect(() => {
    const initialFilters = INITIAL_FILTERS.map((filter) => {
      if (filter.key === "category" && categoryParam) {
        return { ...filter, value: categoryParam };
      }
      return filter;
    });

    resetFilters(initialFilters);
  }, [categoryParam, resetFilters]);

  useEffect(() => {
    let ignore = false;

    void fetchCategories()
      .then((categories) => {
        if (ignore) return;
        updateFilterOptions(
          "category",
          categories.map((category) => ({ label: category.name, value: category.slug })),
        );
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [fetchCategories, updateFilterOptions]);

  const handleCountChange = useCallback((total: number) => setTotalGroups(total), []);

  return (
    <div className="flex flex-col ">
      <AppHeader
        title={"Group Management"}
        subtitle={
          "Every group in the directory, in one place. review, suspend or curate what the community actually sees."
        }
        count={totalGroups}
        filters={filters}
      />
      <div className="mt-6">
        <GroupsTable onCountChange={handleCountChange} />
      </div>
    </div>
  );
}

export default function ExternalGroupsPage() {
  return (
    <Suspense fallback={null}>
      <ExternalGroupsContent />
    </Suspense>
  );
}
