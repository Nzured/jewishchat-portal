export interface IpLocation {
  country: string;
  region: string;
  city: string;
}

interface IpwhoisResponse {
  success: boolean;
  country?: string;
  region?: string;
  city?: string;
}

/** Best-effort location lookup from the visitor's IP, via the free ipwho.is API. Returns null on any failure. */
export async function fetchIpLocation(): Promise<IpLocation | null> {
  try {
    const res = await fetch("https://ipwho.is/");
    if (!res.ok) return null;

    const data = (await res.json()) as IpwhoisResponse;
    if (!data.success) return null;

    return {
      country: data.country ?? "",
      region: data.region ?? "",
      city: data.city ?? "",
    };
  } catch {
    return null;
  }
}
