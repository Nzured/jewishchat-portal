"use client";

import * as React from "react";
import { FilterItem, FilterOption } from "@/types/Search";

function hasFilterValue(item: FilterItem) {
  return Array.isArray(item.value) ? item.value.some(Boolean) : Boolean(item.value);
}

interface SearchFilterContextType {
  filters: FilterItem[];
  appliedFilters: FilterItem[];
  hasActiveFilters: boolean;
  setFilters: React.Dispatch<React.SetStateAction<FilterItem[]>>;
  resetFilters: (items: FilterItem[]) => void;
  updateFilterValue: (key: string, value: string | string[] | null) => void;
  updateFilterOptions: (key: string, options: FilterOption[]) => void;
  updateSearchValue: (key: string, searchValue: string) => void;
  applyFilters: () => void;
  /** Sets and applies a single filter's value in one shot — for chips that stage their own draft locally. */
  applyFilterValue: (key: string, value: string | string[] | null) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
}

const SearchFilterContext = React.createContext<SearchFilterContextType | undefined>(undefined);

export function SearchFilterProvider({
  children,
  initialFilters,
}: {
  children: React.ReactNode;
  initialFilters?: FilterItem[];
}) {
  const [filters, setFilters] = React.useState<FilterItem[]>(initialFilters ?? []);
  const [appliedFilters, setAppliedFilters] = React.useState<FilterItem[]>(initialFilters ?? []);
  const hasActiveFilters = appliedFilters.some(hasFilterValue);

  const resetFilters = React.useCallback((items: FilterItem[]) => {
    setFilters(items);
    setAppliedFilters(items);
  }, []);

  const updateFilterValue = React.useCallback((key: string, value: string | string[] | null) => {
    setFilters((prev) => prev.map((item) => (item.key === key ? { ...item, value } : item)));
  }, []);

  const updateFilterOptions = React.useCallback((key: string, options: FilterOption[]) => {
    setFilters((prev) => prev.map((item) => (item.key === key ? { ...item, options } : item)));
  }, []);

  const updateSearchValue = React.useCallback((key: string, searchValue: string) => {
    setFilters((prev) => prev.map((item) => (item.key === key ? { ...item, searchValue } : item)));
  }, []);

  const applyFilters = React.useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const applyFilterValue = React.useCallback((key: string, value: string | string[] | null) => {
    const update = (item: FilterItem) => (item.key === key ? { ...item, value } : item);
    setFilters((prev) => prev.map(update));
    setAppliedFilters((prev) => prev.map(update));
  }, []);

  const clearFilter = React.useCallback((key: string) => {
    const clear = (item: FilterItem) =>
      item.key === key ? { ...item, value: null, searchValue: "" } : item;
    setFilters((prev) => prev.map(clear));
    setAppliedFilters((prev) => prev.map(clear));
  }, []);

  const clearAllFilters = React.useCallback(() => {
    const clear = (item: FilterItem) => ({ ...item, value: null, searchValue: "" });
    setFilters((prev) => prev.map(clear));
    setAppliedFilters((prev) => prev.map(clear));
  }, []);

  return (
    <SearchFilterContext.Provider
      value={{
        filters,
        appliedFilters,
        hasActiveFilters,
        setFilters,
        resetFilters,
        updateFilterValue,
        updateFilterOptions,
        updateSearchValue,
        applyFilters,
        applyFilterValue,
        clearFilter,
        clearAllFilters,
      }}
    >
      {children}
    </SearchFilterContext.Provider>
  );
}

export function useSearchFilter() {
  const context = React.useContext(SearchFilterContext);
  if (context === undefined) {
    throw new Error("useSearchFilter must be used within a SearchFilterProvider");
  }
  return context;
}
