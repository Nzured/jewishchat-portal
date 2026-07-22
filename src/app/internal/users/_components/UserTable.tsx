"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from "@/configs/const";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { User, UserType } from "@/types/User";
import { externalColumns, internalColumns } from "./columns";
import { ExternalUserCard } from "./ExternalUserCard";
import { InternalUserCard } from "./InternalUserCard";
import { useUserManagementContext } from "../_context/UserManagementContext";

function matchesFilter(row: User, key: string, value: string | string[] | null) {
  if (value == null || value === "") return true;

  switch (key) {
    case "status":
      return row.status.toLowerCase() === String(value).toLowerCase();
    default:
      return true;
  }
}

export default function UserTable({
  tab,
  onCountChange,
}: {
  tab: UserType;
  onCountChange?: (tab: UserType, total: number) => void;
}) {
  const { appliedFilters } = useSearchFilter();
  const { fetchUsers, setLastListedUserIds } = useUserManagementContext();
  const [users, setUsers] = React.useState<User[]>([]);
  const [mobileUsers, setMobileUsers] = React.useState<User[]>([]);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);

  const searchTerm =
    (appliedFilters.find((filter) => filter.key === "userName")?.value as string) || undefined;

  const isInternal = tab === UserType.INTERNAL;
  const columns = isInternal ? internalColumns : externalColumns;
  const renderCard = isInternal
    ? (row: User) => <InternalUserCard row={row} />
    : (row: User) => <ExternalUserCard row={row} />;

  const [prevAppliedFilters, setPrevAppliedFilters] = React.useState(appliedFilters);
  if (appliedFilters !== prevAppliedFilters) {
    setPrevAppliedFilters(appliedFilters);
    setPage(1);
  }

  const [prevTab, setPrevTab] = React.useState(tab);
  const [prevPageSize, setPrevPageSize] = React.useState(pageSize);
  if (tab !== prevTab || pageSize !== prevPageSize) {
    setPrevTab(tab);
    setPrevPageSize(pageSize);
    setPage(1);
  }

  React.useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      setLoading(true);
      try {
        const res = await fetchUsers({
          userType: tab,
          page: page - 1,
          size: pageSize,
          sort: DEFAULT_SORT,
          search: searchTerm,
        });
        if (ignore || !res) return;
        setUsers(res.users);
        setTotalUsers(res.totalElements);
        setMobileUsers((prev) => (page === 1 ? res.users : [...prev, ...res.users]));
        setLastListedUserIds(res.users.map((u) => u.uuid));
        onCountChange?.(tab, res.totalElements);
      } catch {
        if (ignore) return;
        setUsers([]);
        setTotalUsers(0);
        if (page === 1) setMobileUsers([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadUsers();

    return () => {
      ignore = true;
    };
  }, [tab, page, pageSize, searchTerm, fetchUsers, setLastListedUserIds, onCountChange]);

  const filteredUsers = React.useMemo(
    () =>
      users?.filter((row) =>
        appliedFilters.every((filter) => matchesFilter(row, filter.key, filter.value)),
      ),
    [users, appliedFilters],
  );

  const filteredMobileUsers = React.useMemo(
    () =>
      mobileUsers?.filter((row) =>
        appliedFilters.every((filter) => matchesFilter(row, filter.key, filter.value)),
      ),
    [mobileUsers, appliedFilters],
  );

  return (
    <DataTable
      columns={columns}
      data={filteredUsers}
      cardData={filteredMobileUsers}
      renderCard={renderCard}
      getRowId={(row) => row?.uuid}
      loading={loading && page === 1}
      pagination={{
        page,
        pageSize,
        total: totalUsers,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
      infiniteScroll={{
        hasMore: mobileUsers.length < totalUsers,
        onLoadMore: () => setPage((current) => current + 1),
      }}
    />
  );
}
