"use client";

import * as React from "react";
import { CategoryService } from "@/services/group/category.service";
import { Category, CategoryPayload } from "@/types/Category";

interface CategoryContextType {
  categories: Category[];
  categoriesLoading: boolean;
  refetchCategories: () => Promise<void>;
  getCategoryById: (id: number) => Category | undefined;
  createCategory: (payload: CategoryPayload) => Promise<Category>;
  updateCategory: (id: number, payload: CategoryPayload) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

const CategoryContext = React.createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function fetchCategories() {
      try {
        const res = await CategoryService.getAllCategories();
        if (!ignore) setCategories(res?.data ?? []);
      } catch {
        if (!ignore) setCategories([]);
      } finally {
        if (!ignore) setCategoriesLoading(false);
      }
    }

    void fetchCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const refetchCategories = React.useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const res = await CategoryService.getAllCategories();
      setCategories(res?.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const getCategoryById = React.useCallback(
    (id: number) => categories.find((category) => category.id === id),
    [categories],
  );

  const createCategory = React.useCallback(async (payload: CategoryPayload) => {
    const res = await CategoryService.createCategory(payload);
    setCategories((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateCategory = React.useCallback(async (id: number, payload: CategoryPayload) => {
    const res = await CategoryService.updateCategory(id, payload);
    setCategories((prev) => prev.map((category) => (category.id === id ? res.data : category)));
    return res.data;
  }, []);

  const deleteCategory = React.useCallback(async (id: number) => {
    await CategoryService.deleteCategory(id);
    setCategories((prev) => prev.filter((category) => category.id !== id));
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoriesLoading,
        refetchCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = React.useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}
