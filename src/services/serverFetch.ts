const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

type ParamValue = string | number | boolean | null | undefined;

interface ServerGetOptions {
  params?: Record<string, ParamValue>;
  revalidate?: number | false;
  tags?: string[];
}

export class ServerApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
  ) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = "ServerApiError";
  }
}

export async function serverGet<T>(
  path: string,
  { params, revalidate, tags }: ServerGetOptions = {},
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    ...(revalidate === 0 ? { cache: "no-store" } : { next: { revalidate, tags } }),
  });

  if (!res.ok) throw new ServerApiError(res.status, url.pathname);

  return (await res.json()) as T;
}
