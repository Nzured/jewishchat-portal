"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppHeader from "@/components/layout/app/AppHeader";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { FilterItem } from "@/types/Search";
import {
  CATEGORY_FILTER_OPTIONS,
  GROUP_NAME_FILTER_OPTIONS,
  GroupsTable,
  STATUS_FILTER_OPTIONS,
  SUBMITTED_BY_FILTER_OPTIONS,
} from "./_components/GroupsTable";

const INITIAL_FILTERS: FilterItem[] = [
  {
    key: "groupName",
    label: "Group Name",
    component: "AUTOSELECT",
    value: null,
    options: [],
    searchValue: "",
  },
  {
    key: "members",
    label: "Members",
    component: "NUMBER_RANGE",
    value: null,
    options: [],
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
    options: [],
    searchValue: "",
  },
  {
    key: "submittedBy",
    label: "Submitted By",
    component: "AUTOSELECT",
    value: null,
    options: [],
    searchValue: "",
  },
];

function ExternalGroupsContent() {
  const { filters, resetFilters, updateFilterOptions } = useSearchFilter();
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
    updateFilterOptions("groupName", GROUP_NAME_FILTER_OPTIONS);
    updateFilterOptions("category", CATEGORY_FILTER_OPTIONS);
    updateFilterOptions("status", STATUS_FILTER_OPTIONS);
    updateFilterOptions("submittedBy", SUBMITTED_BY_FILTER_OPTIONS);
  }, [categoryParam, resetFilters, updateFilterOptions]);

  return (
    <div className="flex flex-col ">
      <AppHeader
        title={"Group Management"}
        subtitle={
          "Every group in the directory, in one place. review, suspend or curate what the community actually sees."
        }
        count={30}
        filters={filters}
      />
      <div className="mt-6">
        <GroupsTable />
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
