import { getCachedCategories } from "@/services/group/categories";
import { SearchServer } from "@/services/search/search.server";
import { GroupsDirectory } from "./_components/GroupsDirectory";
import { searchKey } from "./_components/searchKey";
import { normalizeSearchSort, SEARCH_SORT_RELEVANCE } from "./_components/searchSorting";

type SearchParamValue = string | string[] | undefined;

interface GroupsPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>;
}

const first = (value: SearchParamValue) => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const params = await searchParams;
  const q = first(params.q);
  const category = first(params.category);
  const city = first(params.city);
  const country = first(params.country);
  const sort = normalizeSearchSort(first(params.sort));

  const [results, categories] = await Promise.all([
    SearchServer.searchGroups({
      q,
      category,
      city,
      country,
      sort: sort === SEARCH_SORT_RELEVANCE ? undefined : sort,
    })
      .then((res) => res.data ?? null)
      .catch(() => null),
    getCachedCategories(),
  ]);

  return (
    <GroupsDirectory
      initialKey={searchKey({ q, category, city, country, sort })}
      initialResults={results}
      categories={categories}
    />
  );
}
