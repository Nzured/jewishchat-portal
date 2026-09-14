import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import { serverGet } from "../serverFetch";
import { GroupSearchResults, SEARCH_SERVICE } from "./search.service";

export interface GroupSearchQuery {
  q?: string;
  category?: string;
  city?: string;
  country?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export const SearchServer = {
  searchGroups: ({
    q,
    category,
    city,
    country,
    sort,
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
  }: GroupSearchQuery) =>
    serverGet<ApiResponse<GroupSearchResults>>(`${SEARCH_SERVICE}/search`, {
      params: { q, category, city, country, sort, page, pageSize },
      revalidate: 0,
    }),
};
