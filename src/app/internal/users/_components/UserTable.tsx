"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { UserType } from "@/types/User";
import { externalColumns, internalColumns } from "./columns";
import { ExternalUserCard } from "./ExternalUserCard";
import { InternalUserCard } from "./InternalUserCard";
import { ALL_USERS } from "./userData";
import { UserRow } from "./UserRow";

function matchesFilter(row: UserRow, key: string, value: string | string[] | null) {
  if (value == null || value === "") return true;

  switch (key) {
    case "userName":
      return row.name === value;
    case "email":
      return row.email === value;
    case "status":
      return row.status.toLowerCase() === String(value).toLowerCase();
    default:
      return true;
  }
}

export default function UserTable({ tab }: { tab: UserType }) {
  const { appliedFilters } = useSearchFilter();
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [mobileCount, setMobileCount] = React.useState(DEFAULT_PAGE_SIZE);

  const isInternal = tab === UserType.INTERNAL;
  const columns = isInternal ? internalColumns : externalColumns;
  const renderCard = isInternal
    ? (row: UserRow) => <InternalUserCard row={row} />
    : (row: UserRow) => <ExternalUserCard row={row} />;

  const filteredUsers = React.useMemo(
    () =>
      ALL_USERS.filter(
        (row) =>
          row.userType === tab &&
          appliedFilters.every((filter) => matchesFilter(row, filter.key, filter.value)),
      ),
    [tab, appliedFilters],
  );

  const [prevAppliedFilters, setPrevAppliedFilters] = React.useState(appliedFilters);
  if (appliedFilters !== prevAppliedFilters) {
    setPrevAppliedFilters(appliedFilters);
    setPage(1);
  }

  const pageData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const mobileData = React.useMemo(
    () => filteredUsers.slice(0, mobileCount),
    [filteredUsers, mobileCount],
  );

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
        total: filteredUsers.length,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
      infiniteScroll={{
        hasMore: mobileCount < filteredUsers.length,
        onLoadMore: () =>
          setMobileCount((count) => Math.min(count + DEFAULT_PAGE_SIZE, filteredUsers.length)),
      }}
    />
  );
}
