import { GROUP_SERVICE } from "@/configs/const";
import { Category } from "@/types/Category";
import { ApiResponse } from "@/types/Common";
import { api } from "../axiosConfig";

export const CategoriesService = {
  listCategories: async () => api.get<ApiResponse<Category[]>>(`${GROUP_SERVICE}/categories`),
};
