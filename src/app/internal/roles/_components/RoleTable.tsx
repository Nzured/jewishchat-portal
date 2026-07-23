"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { NoData } from "@/components/ui/NoData";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { Role } from "@/types/Role";
import { columns } from "./columns";
import { RoleCard } from "./RoleCard";

function matchesFilter(row: Role, key: string, value: string | string[] | null) {
  if (value == null || value === "") return true;

  switch (key) {
    case "role":
      return row.name.toLowerCase().includes(String(value).toLowerCase());
    case "userCount": {
      const [min, max] = Array.isArray(value) ? value : [value, ""];
      if (min && row.userCount < Number(min)) return false;
      if (max && row.userCount > Number(max)) return false;
      return true;
    }
    default:
      return true;
  }
}

export default function RoleTable({ data, loading }: { data: Role[]; loading?: boolean }) {
  const { appliedFilters, hasActiveFilters, clearAllFilters } = useSearchFilter();
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [mobileCount, setMobileCount] = React.useState(DEFAULT_PAGE_SIZE);

  const filteredRoles = React.useMemo(
    () =>
      data?.filter((row) =>
        appliedFilters.every((filter) => matchesFilter(row, filter.key, filter.value)),
      ),
    [data, appliedFilters],
  );

  const [prevAppliedFilters, setPrevAppliedFilters] = React.useState(appliedFilters);
  if (appliedFilters !== prevAppliedFilters) {
    setPrevAppliedFilters(appliedFilters);
    setPage(1);
  }

  const pageData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, page, pageSize]);

  const mobileData = React.useMemo(
    () => filteredRoles.slice(0, mobileCount),
    [filteredRoles, mobileCount],
  );

  const renderCard = (row: Role) => <RoleCard row={row} />;

  return (
    <DataTable
      columns={columns}
      data={pageData}
      cardData={mobileData}
      renderCard={renderCard}
      getRowId={(row) => String(row.id)}
      loading={loading}
      emptyState={
        <NoData
          title={hasActiveFilters ? "No roles match these filters" : "No roles yet"}
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters to see more roles."
              : "Roles you create will show up here."
          }
          onClearFilters={hasActiveFilters ? clearAllFilters : undefined}
        />
      }
      pagination={{
        page,
        pageSize,
        total: filteredRoles.length,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
      infiniteScroll={{
        hasMore: mobileCount < filteredRoles.length,
        onLoadMore: () =>
          setMobileCount((count) => Math.min(count + DEFAULT_PAGE_SIZE, filteredRoles.length)),
      }}
    />
  );
}
