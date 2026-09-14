export interface GroupSearchKeyParts {
  q: string;
  category: string;
  city: string;
  country: string;
  sort: string;
}

export function searchKey({ q, category, city, country, sort }: GroupSearchKeyParts) {
  return `${q}|${category}|${city}|${country}|${sort}`;
}
