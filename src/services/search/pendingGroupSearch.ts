import { SearchService } from "@/services/search/search.service";

type GroupSearchRequest = ReturnType<typeof SearchService.searchGroups>;

/**
 * Hand-off slot between the home page search bar and the groups page.
 *
 * The search request is fired the moment the user submits, i.e. *before* the
 * route transition starts, so the round trip overlaps the navigation instead of
 * following it. The groups page then adopts the in-flight request rather than
 * issuing its own — the user never pays for the call twice, and never waits for
 * a request that only starts once the new page has mounted.
 */
let pending: { query: string; request: GroupSearchRequest } | null = null;

/** Starts the search for `query` and parks it for the groups page to pick up. */
export function startGroupSearch(query: string): void {
  const request = SearchService.searchGroups(query);
  // Nothing awaits the request until the groups page mounts; swallow here so a
  // failure during the transition can't surface as an unhandled rejection. The
  // consumer still sees the original rejection on its own handler.
  request.catch(() => {});
  pending = { query, request };
}

/**
 * Claims the in-flight request for `query`, or returns null when there is none
 * (a direct link, a reload, or a search typed on the groups page itself).
 */
export function takePendingGroupSearch(query: string): GroupSearchRequest | null {
  if (pending?.query !== query) return null;

  const { request } = pending;
  pending = null;
  return request;
}
