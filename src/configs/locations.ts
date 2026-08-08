/**
 * Country and state/region options for the create-group flow, sourced from
 * `country-region-data` (ISO-3166-1/2 based) instead of a hand-maintained list.
 *
 * The API stores `locationCountry` / `locationState` as plain strings, so the
 * option values here are the display names themselves — no id mapping to
 * keep in sync. Countries with no bundled regions (`regions.length === 0`)
 * fall back to free-text entry in the form, same as city, which this package
 * doesn't cover at all.
 */

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
