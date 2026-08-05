export interface ApiResponse<T> {
  message: string;
  data: T;
  status: number;
  statusCode?: number;
}

/**
 * Common shape for paginated API responses. `K` is the name of the field
 * holding the page's items (e.g. "users", "groups"), since it varies by endpoint.
 */
export type Paginated<K extends string, T> = {
  totalPages: number;
  currentPage: number;
  totalElements: number;
  pageSize?: number;
} & Record<K, T[]>;
