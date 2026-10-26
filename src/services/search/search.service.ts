import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/configs/const";
import { Category } from "@/types/Category";
import { ApiResponse } from "@/types/Common";
import { GroupStatus } from "@/types/Group";
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
  about?: string;
  locationCity: string;
  locationState?: string;
  locationCountry: string;
  memberCount: number;
  mainCategoryName: string;
  mainCategorySlug: string;
  mainCategory?: Category;
  categories?: Category[];
  linkVisibilityLoggedInOnly?: boolean;
  submittedByUuid?: string;
  status?: GroupStatus;
  totalViews?: number;
  totalJoinClicks?: number;
  createdOn?: string;
  updatedOn?: string;
  ownerProfileUrl?: string;
  isOwnGroup?: boolean;
  relevanceScore: number;
}

export interface SearchAppliedFilters {
  sort?: string;
  category?: string;
  city?: string;
  country?: string;
}

export interface GroupSearchResults {
  searchId?: string;
  results: SearchGroupResult[];
  totalResults: number;
  page: number;
  pageSize: number;
  query: string;
  semanticSearchUsed: boolean;
  appliedFilters?: SearchAppliedFilters;
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
    name?: string,
  ) =>
    api.get<ApiResponse<GroupSearchResults>>(`${SEARCH_SERVICE}/search`, {
      params: {
        q: search || undefined,
        name: name || undefined,
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
