import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/configs/const";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

type ParamValue = string | number | boolean | null | undefined;

export async function serverAuthGet<T>(
  path: string,
  params?: Record<string, ParamValue>,
): Promise<T | null> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
