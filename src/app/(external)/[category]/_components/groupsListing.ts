export const CATEGORY_GROUPS_PAGE_SIZE = 9;

export const CATEGORY_GROUPS_SORT_OPTIONS = [
  { label: "Most members", value: "memberCount,desc" },
  { label: "Most viewed", value: "totalViews,desc" },
  { label: "Newest", value: "createdOn,desc" },
  { label: "Name A-Z", value: "name,asc" },
];

export const CATEGORY_GROUPS_DEFAULT_SORT = CATEGORY_GROUPS_SORT_OPTIONS[0].value;
