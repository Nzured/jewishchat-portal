export interface GroupLocation {
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
}

export type LocationPart = "city" | "state" | "country";

const ALL_PARTS: LocationPart[] = ["city", "state", "country"];

const PART_ACCESSORS: Record<LocationPart, (location: GroupLocation) => string | null | undefined> =
  {
    city: (location) => location.locationCity,
    state: (location) => location.locationState,
    country: (location) => location.locationCountry,
  };

export function formatLocation(location: GroupLocation, parts: LocationPart[] = ALL_PARTS): string {
  return parts
    .map((part) => PART_ACCESSORS[part](location))
    .filter(Boolean)
    .join(", ");
}

export function formatCityRegion(location: GroupLocation): string {
  return [location.locationCity, location.locationState || location.locationCountry]
    .filter(Boolean)
    .join(", ");
}
