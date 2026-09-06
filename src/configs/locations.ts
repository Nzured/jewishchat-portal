import { allCountries } from "country-region-data";

export interface LocationRegion {
  name: string;
}

export interface LocationCountry {
  name: string;
  regions: LocationRegion[];
}

export const LOCATION_COUNTRIES: LocationCountry[] = allCountries
  .map(([name, , regions]) => ({
    name,
    regions: regions.map(([regionName]) => ({ name: regionName })),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function findLocationCountry(name?: string | null): LocationCountry | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return LOCATION_COUNTRIES.find((country) => country.name.toLowerCase() === normalized);
}
