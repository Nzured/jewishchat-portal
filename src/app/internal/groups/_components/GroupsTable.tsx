"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Eye, Settings, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { NoData } from "@/components/ui/NoData";
import { Typography } from "@/components/ui/Typography";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { formatDate } from "@/lib/date";
import { GroupStatus } from "@/types/Group";
import type { FilterOption } from "@/types/Search";
import { StatusPill } from "./StatusPill";

interface GroupRow {
  id: string;
  name: string;
  path: string;
  avatarLabel: string;
  category: string;
  categoryOverflow: number;
  members: number;
  status: GroupStatus;
  submittedBy: string;
  addedDate: string;
  modifiedDate: string;
}

const PREFIXES = [
  "Monsey",
  "Brooklyn",
  "Lakewood",
  "Boro Park",
  "Crown Heights",
  "Five Towns",
  "Teaneck",
  "Baltimore",
  "Miami",
  "Chicago",
  "Cleveland",
  "Pittsburgh",
];
const SUFFIXES = ["Marketplace", "Bazaar", "Trading Post", "Classifieds", "Exchange"];
const STATES = ["NY", "NJ", "CA", "TX", "FL", "PA", "MD", "OH", "IL", "MA"];
const CATEGORIES = [
  "Real Estate",
  "Automotive",
  "Judaica",
  "Home & Garden",
  "Electronics",
  "Jobs & Gigs",
  "Simcha Services",
];
const SUBMITTERS = [
  "Yossi Brandt",
  "Rachel Green",
  "Mendel Klein",
  "Chaya Weiss",
  "Sara Cohen",
  "Dovid Stern",
  "Esther Friedman",
  "Avi Roth",
];
const MODIFIED = ["2 days ago", "1 day ago", "5 hours ago", "3 days ago", "just now", "1 week ago"];

const TOTAL_GROUPS = 1284;
const BASE_DATE = new Date(2026, 2, 1);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatAddedDate(index: number) {
  return formatDate(dayjs(BASE_DATE).add(index, "day"));
}

function generateGroups(total: number): GroupRow[] {
  return Array.from({ length: total }, (_, index) => {
    const prefix = PREFIXES[index % PREFIXES.length];
    const suffix = SUFFIXES[Math.floor(index / PREFIXES.length) % SUFFIXES.length];
    const name = `${prefix} ${suffix}`;
    const statusCycle: GroupStatus[] = [
      GroupStatus.ACTIVE,
      GroupStatus.ACTIVE,
      GroupStatus.ACTIVE,
      GroupStatus.PENDING,
      GroupStatus.SUSPENDED,
    ];

    return {
      id: `group-${index + 1}`,
      name,
      path: `/groups/${slugify(name)}`,
      avatarLabel: STATES[index % STATES.length],
      category: CATEGORIES[index % CATEGORIES.length],
      categoryOverflow: (index * 3) % 12,
      members: 1500 + ((index * 137) % 8000),
      status: statusCycle[index % statusCycle.length],
      submittedBy: SUBMITTERS[index % SUBMITTERS.length],
      addedDate: formatAddedDate(index),
      modifiedDate: MODIFIED[index % MODIFIED.length],
    };
  });
}

const ALL_GROUPS = generateGroups(TOTAL_GROUPS);

const GROUP_NAME_FILTER_OPTIONS: FilterOption[] = Array.from(
  new Set(ALL_GROUPS.map((group) => group.name)),
).map((name) => ({ label: name, value: name }));

const CATEGORY_FILTER_OPTIONS: FilterOption[] = CATEGORIES.map((category) => ({
  label: category,
  value: category,
}));

const SUBMITTED_BY_FILTER_OPTIONS: FilterOption[] = SUBMITTERS.map((submitter) => ({
  label: submitter,
  value: submitter,
}));

const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
];

const columns: DataTableColumn<GroupRow>[] = [
  {
    id: "name",
    header: "Group Name",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar variant="tile" name={row.name} />
        <div className="flex flex-col">
          <Typography variant="small" className="font-semibold text-ink-1">
            {row.name}
          </Typography>
          <Typography variant="muted">{row.path}</Typography>
        </div>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: (row) => (
      <div className="flex items-center gap-1.5">
        <Chip label={row.category} shape="pill" className="text-ink-2" />
        {row.categoryOverflow > 0 && (
          <Typography variant="tiny" className="text-ink-4">
            +{row.categoryOverflow}
          </Typography>
        )}
      </div>
    ),
  },
  {
    id: "members",
    header: "Members",
    cell: (row) => (
      <Typography variant="small" className="font-medium tabular-nums text-ink-2">
        {row.members.toLocaleString()}
      </Typography>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusPill status={row.status} />,
  },
  {
    id: "submittedBy",
    header: "Submitted By",
    cell: (row) => <Typography variant="small">{row.submittedBy}</Typography>,
  },
  {
    id: "addedDate",
    header: "Added Date",
    cell: (row) => <Typography variant="small">{row.addedDate}</Typography>,
  },
  {
    id: "modifiedDate",
    header: "Modified Date",
    cell: (row) => <Typography variant="small">{row.modifiedDate}</Typography>,
  },
  {
    id: "actions",
    header: "",
    headerClassName: "text-right",
    cellClassName: "text-right",
    cell: (row) => (
      <div className="flex items-center justify-end gap-1">
        <Button variant="icon" size="icon-sm" aria-label={`Edit ${row.name}`}>
          <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green text-ink-4" />
        </Button>
        <Button
          variant="icon"
          size="icon-sm"
          aria-label={`Delete ${row.name}`}
          className="hover:bg-state-danger/10 hover:text-state-danger"
        >
          <Trash2 className="text-ink-3 transition-colors group-hover/button:text-state-danger text-ink-4" />
        </Button>
      </div>
    ),
  },
];

function renderGroupCard(row: GroupRow) {
  return (
    <Card key={row.id} size="sm" className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar variant="tile" name={row.name} />
            <div className="flex flex-col">
              <Typography variant="small" className="font-semibold text-ink-1">
                {row.name}
              </Typography>
              <Typography variant="muted">{row.path}</Typography>
            </div>
          </div>
          <StatusPill status={row.status} />
        </div>

        <div className="flex items-center gap-1.5">
          <Chip label={row.category} shape="pill" />
          {row.categoryOverflow > 0 && (
            <Typography variant="muted">+{row.categoryOverflow}</Typography>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Typography variant="muted">
            <span className="font-medium tabular-nums text-ink-1">
              {row.members.toLocaleString()}
            </span>{" "}
            members
          </Typography>
          <Typography variant="muted">Added {row.addedDate}</Typography>
        </div>

        <div className="flex items-center justify-between border-t border-surface-line pt-3">
          <Typography variant="muted">
            <span className="font-medium text-ink-1">{row.submittedBy}</span> · {row.modifiedDate}
          </Typography>
          <div className="flex items-center gap-1">
            <Button variant="icon" size="icon-sm" aria-label={`View ${row.name}`}>
              <Eye className="text-ink-3 transition-colors group-hover/button:text-brand-green" />
            </Button>
            <Button variant="icon" size="icon-sm" aria-label={`Edit ${row.name}`}>
              <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green" />
            </Button>
            <Button
              variant="icon"
              size="icon-sm"
              aria-label={`Delete ${row.name}`}
              className="hover:bg-state-danger/10 hover:text-state-danger"
            >
              <Trash2 className="text-ink-3 transition-colors group-hover/button:text-state-danger" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function matchesFilter(row: GroupRow, key: string, value: string | string[] | null) {
  if (value == null || value === "") return true;

  switch (key) {
    case "groupName":
      return row.name === value;
    case "category":
      return row.category === value;
    case "submittedBy":
      return row.submittedBy === value;
    case "status":
      return row.status === value;
    case "members": {
      const [min, max] = Array.isArray(value) ? value : [value, ""];
      if (min && row.members < Number(min)) return false;
      if (max && row.members > Number(max)) return false;
      return true;
    }
    default:
      return true;
  }
}

export function GroupsTable() {
  const { appliedFilters, hasActiveFilters, clearAllFilters } = useSearchFilter();
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [mobileCount, setMobileCount] = React.useState(DEFAULT_PAGE_SIZE);

  const filteredGroups = React.useMemo(
    () =>
      ALL_GROUPS.filter((row) =>
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
    return filteredGroups.slice(start, start + pageSize);
  }, [filteredGroups, page, pageSize]);

  const mobileData = React.useMemo(
    () => filteredGroups.slice(0, mobileCount),
    [filteredGroups, mobileCount],
  );

  return (
    <DataTable
      columns={columns}
      data={pageData}
      cardData={mobileData}
      renderCard={renderGroupCard}
      getRowId={(row) => row.id}
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
        total: filteredGroups.length,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
      infiniteScroll={{
        hasMore: mobileCount < filteredGroups.length,
        onLoadMore: () =>
          setMobileCount((count) => Math.min(count + DEFAULT_PAGE_SIZE, filteredGroups.length)),
      }}
    />
  );
}

export {
  CATEGORY_FILTER_OPTIONS,
  GROUP_NAME_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  SUBMITTED_BY_FILTER_OPTIONS,
};
