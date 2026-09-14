import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_TAGS } from "@/services/group/group.server";
import { USERS_CACHE_TAG } from "@/services/user/user.server";

const KNOWN_TAGS = new Set<string>([...Object.values(CACHE_TAGS), USERS_CACHE_TAG, "seo"]);

interface RevalidateBody {
  tags?: unknown;
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 });
  }

  const provided = request.headers.get("x-revalidate-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as RevalidateBody;
  const requested = Array.isArray(body.tags) ? body.tags : [];
  const tags = requested.filter(
    (tag): tag is string => typeof tag === "string" && KNOWN_TAGS.has(tag),
  );

  if (tags.length === 0) {
    return NextResponse.json({ error: "No valid tags", allowed: [...KNOWN_TAGS] }, { status: 400 });
  }

  tags.forEach((tag) => revalidateTag(tag, "max"));

  return NextResponse.json({ revalidated: tags, at: new Date().toISOString() });
}
