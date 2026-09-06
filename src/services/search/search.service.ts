import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import api from "../axiosConfig";

export const SEARCH_SERVICE = "/search-service/api/v1";

export interface SearchSuggestion {
  term: string;
  categorySlug: string;
  groupCount: number;
}

export interface SearchGroupResult {
  uuid: string;
  slug: string;
  name: string;
  thumbnailUrl?: string | null;
  shortDesc: string;
  locationCity: string;
  locationCountry: string;
  memberCount: number;
  mainCategoryName: string;
  mainCategorySlug: string;
  relevanceScore: number;
}

export interface GroupSearchResults {
  searchId?: string;
  results: SearchGroupResult[];
  totalResults: number;
  page: number;
  pageSize: number;
  query: string;
  semanticSearchUsed: boolean;
}

export const SearchService = {
  searchGroups: (
    search?: string,
    category?: string,
    city?: string,
    country?: string,
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    sort?: string,
  ) =>
    api.get<ApiResponse<GroupSearchResults>>(`${SEARCH_SERVICE}/search`, {
      params: {
        q: search || undefined,
        category: category || undefined,
        city: city || undefined,
        country: country || undefined,
        page,
        pageSize,
        sort: sort || undefined,
      },
    }),
  autoComplete: (prefix: string) =>
    api.get<ApiResponse<SearchSuggestion[]>>(`${SEARCH_SERVICE}/search/autocomplete`, {
      params: { prefix },
    }),
};
