"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { Role } from "@/types/Role";
import { columns } from "./columns";
import { RoleCard } from "./RoleCard";
import { ALL_ROLES } from "./roleData";

function matchesFilter(row: Role, key: string, value: string | string[] | null) {
  if (value == null || value === "") return true;

  switch (key) {
    case "role":
      return row.role.toLowerCase().includes(String(value).toLowerCase());
    case "users":
      return (row.users ?? []).some((u) => u.name === value);
    default:
      return true;
  }
}

export default function RoleTable() {
  const { appliedFilters } = useSearchFilter();
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [mobileCount, setMobileCount] = React.useState(DEFAULT_PAGE_SIZE);

  const filteredRoles = React.useMemo(
    () =>
      ALL_ROLES.filter((row) =>
        appliedFilters.every((filter) => matchesFilter(row, filter.key, filter.value)),
      ),
    [appliedFilters],
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
      getRowId={(row) => row.id}
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
