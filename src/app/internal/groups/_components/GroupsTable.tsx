"use client";

import * as React from "react";
import { Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { NoData } from "@/components/ui/NoData";
import { Typography } from "@/components/ui/Typography";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  EXTERNAL_GROUPS_PATH,
  NOT_APPLICABLE,
} from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { formatDate } from "@/lib/date";
import { Group, GroupStatus } from "@/types/Group";
import type { FilterOption } from "@/types/Search";
import { GroupCard } from "./GroupCard";
import { StatusPill } from "./StatusPill";
import { useAdminGroupContext } from "../_context/AdminGroupContext";

const FIRST_PAGE = 1;

const STATUS_FILTER_OPTIONS: FilterOption[] = Object.values(GroupStatus).map((status) => ({
  label: wordFormatter(status),
  value: status,
}));

function countExtraCategories(group: Group) {
  return group.categories?.filter((category) => category.id !== group.mainCategory?.id).length ?? 0;
}

function getColumns({ onEdit }: { onEdit: (group: Group) => void }): DataTableColumn<Group>[] {
  return [
    {
      id: "name",
      header: "Group Name",
      cell: (group) => (
        <div className="flex items-center gap-3">
          <Avatar variant="tile" src={group.thumbnailUrl ?? undefined} name={group.name} />
          <div className="flex flex-col">
            <Typography variant="small" className="font-semibold text-ink-1">
              {group.name}
            </Typography>
            <Typography variant="muted">{`${EXTERNAL_GROUPS_PATH}/${group.slug}`}</Typography>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (group) => {
        const category = group.mainCategory?.name ?? NOT_APPLICABLE;
        const overflow = countExtraCategories(group);

        return (
          <div className="flex max-w-40 items-center gap-1.5 lg:max-w-60">
            <Chip
              label={category}
              shape="pill"
              title={category}
              className="min-w-0 shrink text-ink-2"
            />
            {overflow > 0 && (
              <Typography variant="tiny" className="shrink-0 whitespace-nowrap text-ink-4">
                +{overflow}
              </Typography>
            )}
          </div>
        );
      },
    },
    {
      id: "members",
      header: "Members",
      cell: (group) => (
        <Typography variant="small" className="font-medium tabular-nums text-ink-2">
          {group.memberCount.toLocaleString()}
        </Typography>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (group) => <StatusPill status={group.status} />,
    },
    {
      id: "submittedBy",
      header: "Submitted By",
      cell: (group) => (
        <Typography variant="small">{group.createdByUser?.firstName || NOT_APPLICABLE}</Typography>
      ),
    },
    {
      id: "addedDate",
      header: "Added Date",
      cell: (group) => (
        <Typography variant="small">
          {group.createdOn ? formatDate(group.createdOn) : NOT_APPLICABLE}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (group) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="icon"
            size="icon-sm"
            aria-label={`Edit ${group.name}`}
            onClick={() => onEdit(group)}
          >
            <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green text-ink-4" />
          </Button>
          <Button
            variant="icon"
            size="icon-sm"
            aria-label={`Delete ${group.name}`}
            className="hover:bg-state-danger/10 hover:text-state-danger"
          >
            <Trash2 className="text-ink-3 transition-colors group-hover/button:text-state-danger text-ink-4" />
          </Button>
        </div>
      ),
    },
  ];
}

function matchesFilter(group: Group, key: string, value: string | string[] | null) {
  if (value == null || value === "") return true;

  switch (key) {
    case "members": {
      const [min, max] = Array.isArray(value) ? value : [value, ""];
      if (min && group.memberCount < Number(min)) return false;
      if (max && group.memberCount > Number(max)) return false;
      return true;
    }
    default:
      return true;
  }
}

export function GroupsTable({ onCountChange }: { onCountChange?: (total: number) => void }) {
  const router = useRouter();
  const { appliedFilters, hasActiveFilters, clearAllFilters } = useSearchFilter();
  const { fetchGroups, setLastListedGroupIds } = useAdminGroupContext();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [mobileGroups, setMobileGroups] = React.useState<Group[]>([]);
  const [totalGroups, setTotalGroups] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(FIRST_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);

  const filterValue = (key: string) =>
    (appliedFilters.find((filter) => filter.key === key)?.value as string) || undefined;

  const search = filterValue("groupName");
  const status = filterValue("status") as GroupStatus | undefined;
  const category = filterValue("category");

  const [prevAppliedFilters, setPrevAppliedFilters] = React.useState(appliedFilters);
  if (appliedFilters !== prevAppliedFilters) {
    setPrevAppliedFilters(appliedFilters);
    setPage(FIRST_PAGE);
  }

  React.useEffect(() => {
    let ignore = false;

    async function loadGroups() {
      setLoading(true);
      try {
        const res = await fetchGroups({
          search,
          status,
          category,
          page: page - 1,
          pageSize,
          sort: DEFAULT_SORT,
        });
        if (ignore || !res) return;
        setGroups(res.groups);
        setTotalGroups(res.totalElements);
        setMobileGroups((prev) => (page === FIRST_PAGE ? res.groups : [...prev, ...res.groups]));
        setLastListedGroupIds(res.groups.map((group) => group.uuid));
        onCountChange?.(res.totalElements);
      } catch {
        if (ignore) return;
        setGroups([]);
        setTotalGroups(0);
        if (page === FIRST_PAGE) setMobileGroups([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadGroups();

    return () => {
      ignore = true;
    };
  }, [fetchGroups, setLastListedGroupIds, onCountChange, page, pageSize, search, status, category]);

  const filteredGroups = React.useMemo(
    () =>
      groups.filter((group) =>
        appliedFilters.every((filter) => matchesFilter(group, filter.key, filter.value)),
      ),
    [groups, appliedFilters],
  );

  const filteredMobileGroups = React.useMemo(
    () =>
      mobileGroups.filter((group) =>
        appliedFilters.every((filter) => matchesFilter(group, filter.key, filter.value)),
      ),
    [mobileGroups, appliedFilters],
  );

  const handleEdit = React.useCallback(
    (group: Group) => router.push(`/internal/groups/${group.uuid}`),
    [router],
  );
  const columns = React.useMemo(() => getColumns({ onEdit: handleEdit }), [handleEdit]);

  return (
    <DataTable
      columns={columns}
      data={filteredGroups}
      cardData={filteredMobileGroups}
      renderCard={(group) => <GroupCard group={group} onEdit={handleEdit} />}
      getRowId={(group) => group.uuid}
      loading={loading && page === FIRST_PAGE}
      emptyState={
        <NoData
          title={hasActiveFilters ? "No groups match these filters" : "No groups yet"}
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters to see more groups."
              : "Groups submitted to the directory will show up here."
          }
          onClearFilters={hasActiveFilters ? clearAllFilters : undefined}
        />
      }
      pagination={{
        page,
        pageSize,
        total: totalGroups,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(FIRST_PAGE);
        },
      }}
      infiniteScroll={{
        hasMore: mobileGroups.length < totalGroups,
        onLoadMore: () => setPage((current) => current + 1),
      }}
    />
  );
}

export { STATUS_FILTER_OPTIONS };
