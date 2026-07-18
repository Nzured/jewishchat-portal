"use client";

import { useState } from "react";
import { useCategories } from "@/app/internal/categories/_context/CategoryContext";
import AppHeader from "@/components/layout/app/AppHeader";
import { Category } from "@/types/Category";
import { FilterItem } from "@/types/Search";
import { AddCategoryModal } from "./_components/AddCategoryModal";
import CategoryTable from "./_components/CategoryTable";

export default function CategoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { categories, categoriesLoading } = useCategories();

  const handleModalOpenChange = (nextOpen: boolean) => {
    setModalOpen(nextOpen);
    if (!nextOpen) setEditingCategory(null);
  };

  const INITIAL_FILTERS: FilterItem[] = [
    {
      key: "name",
      label: "Name",
      component: "AUTOSELECT",
      value: null,
      options: categories.map((category) => ({ label: category.name, value: category.name })),
      searchValue: "",
    },
    {
      key: "groups",
      label: "Groups",
      component: "NUMBER_RANGE",
      value: null,
    },
  ];

  return (
    <>
      <AppHeader
        title="Category Management"
        subtitle="The groups the community browses by. Each category has a public directory page and lives in the sitemap."
        count={Number(categories.length)}
        countLabel="Categories"
        filters={INITIAL_FILTERS}
        buttonLabel="Add Category"
        onButtonPress={() => {
          setEditingCategory(null);
          setModalOpen(true);
        }}
      />
      <div className="mt-6">
        <CategoryTable
          onEdit={(category) => {
            setEditingCategory(category);
            setModalOpen(true);
          }}
          data={categories}
          loading={categoriesLoading}
        />
      </div>
      <AddCategoryModal
        open={modalOpen}
        setOpen={handleModalOpenChange}
        category={editingCategory}
      />
    </>
  );
}
