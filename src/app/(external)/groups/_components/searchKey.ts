export interface GroupSearchKeyParts {
  q: string;
  name: string;
  category: string;
  city: string;
  country: string;
  sort: string;
}

export function searchKey({ q, name, category, city, country, sort }: GroupSearchKeyParts) {
  return `${q}|${name}|${category}|${city}|${country}|${sort}`;
}
