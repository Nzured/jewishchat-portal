"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T, rowIndex: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface DataTableInfiniteScroll {
  hasMore: boolean;
  onLoadMore: () => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T, index: number) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  pagination?: DataTablePagination;
  emptyState?: React.ReactNode;
  rowClassName?: (row: T) => string;
  className?: string;
  /** Renders each row as a card on mobile viewports, replacing the table. */
  renderCard?: (row: T, rowIndex: number) => React.ReactNode;
  /** Rows to render as cards on mobile; defaults to `data` (the current table page). */
  cardData?: T[];
  /** Mobile-only "load more" trigger, used instead of numbered pagination. */
  infiniteScroll?: DataTableInfiniteScroll;
  /** Shows skeleton rows/cards instead of `data` while fetching. */
  loading?: boolean;
  /** Number of skeleton rows to render while `loading`. Defaults to the page size, or 5. */
  skeletonRowCount?: number;
}

function getPageNumbers(current: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
    .reduce<(number | "ellipsis")[]>((acc, page) => {
      const prev = acc[acc.length - 1];
      if (typeof prev === "number" && page - prev > 1) acc.push("ellipsis");
      acc.push(page);
      return acc;
    }, []);
}

function DataTablePaginationControls({ pagination }: { pagination: DataTablePagination }) {
  const { page, pageSize, total, onPageChange, onPageSizeChange } = pagination;
  const pageSizeOptions = pagination.pageSizeOptions ?? [10, 20, 30, 50];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
      <Typography className="text-ink-4" variant="muted">
        Showing{" "}
        <span className="font-semibold text-ink-2">
          {rangeStart.toLocaleString()} – {rangeEnd.toLocaleString()}
        </span>{" "}
        of <span className="font-semibold text-ink-2">{total.toLocaleString()}</span>
      </Typography>

      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <Typography variant="muted" className="text-ink-3">
              Rows per page
            </Typography>
            <SelectDropdown
              items={pageSizeOptions.map((option) => ({
                label: String(option),
                value: String(option),
              }))}
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
              className="w-fit border-surface-line text-ink-2"
              size="sm"
            />
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="icon"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          {getPageNumbers(page, totalPages).map((entry, index) =>
            entry === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-ink-4 select-none">
                …
              </span>
            ) : (
              <Button
                key={entry}
                variant={entry === page ? "default" : "icon"}
                size="icon-sm"
                onClick={() => onPageChange(entry)}
                className={cn(entry === page && "text-surface-card")}
              >
                {entry}
              </Button>
            ),
          )}
          <Button
            variant="icon"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataTableInfiniteScrollSentinel({ hasMore, onLoadMore }: DataTableInfiniteScroll) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const onLoadMoreRef = React.useRef(onLoadMore);

  React.useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  React.useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div ref={sentinelRef} className="flex items-center justify-center py-4">
      <Typography variant="muted">
        {hasMore ? "Loading more…" : "You've reached the end."}
      </Typography>
    </div>
  );
}

function DataTable<T>({
  columns,
  data,
  getRowId,
  selectable = false,
  selectedIds = [],
  onSelectedIdsChange,
  pagination,
  emptyState = "No results found.",
  rowClassName,
  className,
  renderCard,
  cardData,
  infiniteScroll,
  loading = false,
  skeletonRowCount,
}: DataTableProps<T>) {
  const rowIds = React.useMemo(
    () => data?.map((row, index) => getRowId(row, index)),
    [data, getRowId],
  );
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
  const skeletonRows = skeletonRowCount ?? pagination?.pageSize ?? 5;

  const toggleAll = (checked: boolean) => {
    if (!onSelectedIdsChange) return;
    onSelectedIdsChange(checked ? rowIds : []);
  };

  const toggleRow = (id: string, checked: boolean) => {
    if (!onSelectedIdsChange) return;
    onSelectedIdsChange(
      checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id),
    );
  };

  const cardView = renderCard ? { rows: cardData ?? data, renderCard } : null;

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-3", className)}>
      {cardView && (
        <div className="flex flex-col gap-3 md:hidden">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-xl border border-surface-line bg-surface-card p-4"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          ) : cardView.rows.length === 0 ? (
            <div className="rounded-xl border border-surface-line bg-surface-card">
              <EmptyState message={emptyState} className="py-10" />
            </div>
          ) : (
            cardView.rows.map((row, index) => (
              <React.Fragment key={getRowId(row, index)}>
                {cardView.renderCard(row, index)}
              </React.Fragment>
            ))
          )}
          {infiniteScroll && !loading && cardView.rows.length > 0 && (
            <DataTableInfiniteScrollSentinel
              hasMore={infiniteScroll.hasMore}
              onLoadMore={infiniteScroll.onLoadMore}
            />
          )}
        </div>
      )}

      <div
        data-slot="data-table-grid"
        className={cn(
          "rounded-xl border border-surface-line bg-surface-card",
          cardView && "hidden md:block",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.id} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                  {selectable && (
                    <TableCell>
                      <Skeleton className="size-4" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.cellClassName}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState message={emptyState} className="py-10" />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = rowIds[rowIndex];
                const isSelected = selectedSet.has(rowId);
                return (
                  <TableRow
                    key={rowId}
                    data-state={isSelected ? "selected" : undefined}
                    className={rowClassName?.(row)}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleRow(rowId, checked === true)}
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id} className={column.cellClassName}>
                        {column.cell(row, rowIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {pagination && !loading && (
          <div className="border-t border-surface-line">
            <DataTablePaginationControls pagination={pagination} />
          </div>
        )}
      </div>
    </div>
  );
}

export { DataTable };
export type { DataTableColumn, DataTablePagination, DataTableProps };
