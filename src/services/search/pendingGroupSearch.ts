import { SearchService } from "@/services/search/search.service";

type GroupSearchRequest = ReturnType<typeof SearchService.searchGroups>;

let pending: { query: string; request: GroupSearchRequest } | null = null;

export function startGroupSearch(query: string): void {
  const request = SearchService.searchGroups(query);
  request.catch(() => {});
  pending = { query, request };
}

export function takePendingGroupSearch(query: string): GroupSearchRequest | null {
  if (pending?.query !== query) return null;

  const { request } = pending;
  pending = null;
  return request;
}
