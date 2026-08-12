import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { ApiResponse } from "@/types/Common";
import api from "../axiosConfig";

const SEARCH_SERVICE = "/search-service/api/v1";

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
  ) =>
    api.get<ApiResponse<GroupSearchResults>>(`${SEARCH_SERVICE}/search`, {
      // Axios sends "" as a real (empty) param rather than omitting it, and
      // the backend appears to treat a present-but-empty category/city/country
      // as "match nothing" rather than "no filter" — so blank values are left
      // out of the request entirely instead of being sent as "".
      params: {
        q: search || undefined,
        category: category || undefined,
        city: city || undefined,
        country: country || undefined,
        page,
        pageSize,
      },
    }),
  autoComplete: (prefix: string) =>
    api.get<ApiResponse<SearchSuggestion[]>>(`${SEARCH_SERVICE}/search/autocomplete`, {
      params: { prefix },
    }),
};
