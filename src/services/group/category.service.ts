import { GROUP_SERVICE_ADMIN } from "@/configs/const";
import { Category, CategoryPayload } from "@/types/Category";
import { ApiResponse } from "@/types/Common";
import api from "../axiosConfig";

export const CategoryService = {
  createCategory: (payload: CategoryPayload) =>
    api.post<ApiResponse<Category>>(`${GROUP_SERVICE_ADMIN}/categories`, undefined, {
      params: payload,
      globalLoader: true,
    }),
  updateCategory: (id: number, payload: CategoryPayload) =>
    api.patch<ApiResponse<Category>>(`${GROUP_SERVICE_ADMIN}/categories/${id}`, payload, {
      globalLoader: true,
    }),
  deleteCategory: (id: number) =>
    api.delete<ApiResponse<Category>>(`${GROUP_SERVICE_ADMIN}/categories/${id}`, {
      globalLoader: true,
    }),
  getAllCategories: () => api.get<ApiResponse<Category[]>>(`${GROUP_SERVICE_ADMIN}/categories`),
};
