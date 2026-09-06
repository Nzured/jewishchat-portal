export const SEARCH_SORT_RELEVANCE = "relevance";

export const GROUP_SEARCH_SORT_OPTIONS = [
  { label: "Relevance", value: SEARCH_SORT_RELEVANCE },
  { label: "Most members", value: "memberCount,desc" },
  { label: "Most viewed", value: "totalViews,desc" },
  { label: "Newest", value: "createdOn,desc" },
  { label: "Name A-Z", value: "name,asc" },
];
