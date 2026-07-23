"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/DataTable";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { NoData } from "@/components/ui/NoData";
import { Typography } from "@/components/ui/Typography";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { Category } from "@/types/Category";
import { CategoryCard } from "./CategoryCard";
import { getColumns } from "./columns";
import { useCategories } from "../_context/CategoryContext";

function matchesFilter(row: Category, key: string, value: string | string[] | null) {
  if (value == null || value === "") return true;

  switch (key) {
    case "name":
      return row.name.toLowerCase().includes(String(value).toLowerCase());
    case "slug":
      return row.slug === value;

    default:
      return true;
  }
}

interface CategoryTableProps {
  onEdit: (category: Category) => void;
  data: Category[];
  loading?: boolean;
}

export default function CategoryTable({ onEdit, data, loading }: CategoryTableProps) {
  const { deleteCategory } = useCategories();
  const { appliedFilters, hasActiveFilters, clearAllFilters } = useSearchFilter();
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [mobileCount, setMobileCount] = React.useState(DEFAULT_PAGE_SIZE);
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null);

  const filteredCategories = React.useMemo(
    () =>
      data?.filter((row) =>
        appliedFilters.every((filter) => matchesFilter(row, filter.key, filter.value)),
      ),
    [appliedFilters, data],
  );

  const [prevAppliedFilters, setPrevAppliedFilters] = React.useState(appliedFilters);
  if (appliedFilters !== prevAppliedFilters) {
    setPrevAppliedFilters(appliedFilters);
    setPage(1);
  }

  const pageData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, page, pageSize]);

  const mobileData = React.useMemo(
    () => filteredCategories.slice(0, mobileCount),
    [filteredCategories, mobileCount],
  );

  const columns = React.useMemo(
    () =>
      getColumns({
        onEdit,
        onDelete: setCategoryToDelete,
      }),
    [onEdit],
  );

  const renderCard = (row: Category) => (
    <CategoryCard row={row} onEdit={onEdit} onDelete={setCategoryToDelete} />
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={pageData}
        cardData={mobileData}
        renderCard={renderCard}
        getRowId={(row) => String(row.id)}
        loading={loading}
        emptyState={
          <NoData
            title={hasActiveFilters ? "No categories match these filters" : "No categories yet"}
            description={
              hasActiveFilters
                ? "Try adjusting or clearing your filters to see more categories."
                : "Categories you create will show up here."
            }
            onClearFilters={hasActiveFilters ? clearAllFilters : undefined}
          />
        }
        pagination={{
          page,
          pageSize,
          total: filteredCategories.length,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
        infiniteScroll={{
          hasMore: mobileCount < filteredCategories.length,
          onLoadMore: () =>
            setMobileCount((count) =>
              Math.min(count + DEFAULT_PAGE_SIZE, filteredCategories.length),
            ),
        }}
      />
      <DeleteModal
        open={categoryToDelete != null}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Permanently delete this category?"
        description={
          <>
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              This cannot be undone.
            </Typography>{" "}
            It removes{" "}
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {categoryToDelete?.name}
            </Typography>{" "}
            and its public directory page. Groups in this category will need to be recategorized.
          </>
        }
        onConfirm={() => {
          if (categoryToDelete) void deleteCategory(categoryToDelete.id);
        }}
      />
    </>
  );
}
