export interface IpLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
}

interface IpwhoisResponse {
  success: boolean;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
}

export async function fetchIpLocation(): Promise<IpLocation | null> {
  try {
    const res = await fetch("https://ipwho.is/");
    if (!res.ok) return null;

    const data = (await res.json()) as IpwhoisResponse;
    if (!data.success) return null;

    return {
      country: data.country ?? "",
      countryCode: data.country_code ?? "",
      region: data.region ?? "",
      city: data.city ?? "",
    };
  } catch {
    return null;
  }
}

let cachedLookup: Promise<IpLocation | null> | null = null;

export function fetchIpLocationCached(): Promise<IpLocation | null> {
  cachedLookup ??= fetchIpLocation();
  return cachedLookup;
}
