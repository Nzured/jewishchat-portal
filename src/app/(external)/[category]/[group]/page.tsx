import { cache } from "react";
import { ArrowLeft } from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Link } from "@/components/ui/Link";
import { NoData } from "@/components/ui/NoData";
import {
  CANONICAL_SITE_URL,
  EXTERNAL_GROUPS_PATH,
  EXTERNAL_HOME_PATH,
  RESERVED_ROUTE_SLUGS,
} from "@/configs/const";
import { getCategoryPath, getGroupPath } from "@/lib/publicPaths";
import { GroupService } from "@/services/group/group.service";
import { resolveSeoRedirect } from "@/services/seo/seo.service";
import { Group, GroupStatus } from "@/types/Group";
import { GroupAbout } from "./_components/GroupAbout";
import { GroupSummary } from "./_components/GroupSummary";
import { RelatedGroups } from "./_components/RelatedGroups";
import type { Metadata } from "next";

interface GroupPageProps {
  params: Promise<{ category: string; group: string }>;
}

const findGroup = cache(async (category: string, slug: string) => {
  try {
    const res = await GroupService.getGroupByCategoryAndSlug(category, slug);
    return res.data;
  } catch {
    return null;
  }
});

function formatLocation(group: Group): string {
  return [group.locationCity, group.locationState, group.locationCountry]
    .filter(Boolean)
    .join(", ");
}

const findRelated = cache(async (uuid: string) => {
  try {
    const res = await GroupService.getRelatedGroups(uuid);
    return res.data ?? [];
  } catch {
    return [];
  }
});

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const { category, group: slug } = await params;
  if (RESERVED_ROUTE_SLUGS.includes(category)) return {};

  const group = await findGroup(category, slug);
  if (!group) return {};

  // The redirect target (the canonical category's own page load) is the one
  // that should carry real metadata — this response is just a 301/308 hop.
  const canonicalCategory = group.mainCategory?.slug;
  if (canonicalCategory && canonicalCategory !== category) return {};

  const categoryName = group.mainCategory?.name ?? "";
  const isActive = group.status === GroupStatus.ACTIVE;
  const title = `${group.name} — ${categoryName} Group | ChatList`;
  const description =
    `${group.shortDesc ?? ""} Join this ${categoryName} WhatsApp group on ChatList.`.trim();
  const path = getGroupPath(group);
  // FR-SEO-META-03 — the group's real photo when there is one; the site logo
  // otherwise, rather than no image at all.
  const image = group.thumbnailUrl || `${CANONICAL_SITE_URL}/svgs/logo.svg`;

  return {
    title,
    description,
    alternates: { canonical: path },
    // FR-SEO-LC-03 — never indexable while the group isn't a live, active
    // listing (suspended, pending moderation, ...).
    robots: isActive ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { category, group: slug } = await params;

  // FR-SEO-URL-06 — a category slug must never shadow a real system route.
  if (RESERVED_ROUTE_SLUGS.includes(category)) {
    notFound();
  }

  const group = await findGroup(category, slug);
  if (!group) {
    // FR-SEO-URL-02/09/10 — the group may have been renamed or moved to a
    // different category; check the backend's redirect table before giving
    // up and rendering a real 404.
    const canonicalPath = await resolveSeoRedirect(`${category}/${slug}`);
    if (canonicalPath) {
      permanentRedirect(`/${canonicalPath}`);
    }
    notFound();
  }

  // A group only ever resolves at its main category's URL (FR-SEO-CAN-02) —
  // send a stale/wrong category segment to the canonical path with a real
  // 308 instead of rendering a second route for it.
  const canonicalCategory = group.mainCategory?.slug;
  if (canonicalCategory && canonicalCategory !== category) {
    permanentRedirect(getGroupPath(group));
  }

  // FR-SEO-LC-03/FR-SEO-TECH-05 — a suspended (or otherwise not-yet-live)
  // group renders a real page, not a soft-404, but never the normal listing.
  const isActive = group.status === GroupStatus.ACTIVE;
  const related = isActive ? await findRelated(group.uuid) : [];

  const categoryName = group.mainCategory?.name ?? "";
  const categoryPath = canonicalCategory ? getCategoryPath(canonicalCategory) : null;
  const groupPath = getGroupPath(group);
  const groupUrl = `${CANONICAL_SITE_URL}${groupPath}`;
  const location = formatLocation(group);

  // Section 5.3 — Organization + BreadcrumbList, linked by stable @id. Only
  // describes what's actually rendered below (FR-SEO-SD-03): no fabricated
  // ratings/NAP data, and `image`/`areaServed` are omitted when there's
  // nothing real to put there rather than filled with a placeholder.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${groupUrl}/#group`,
        name: group.name,
        description: group.shortDesc,
        url: groupUrl,
        ...(group.thumbnailUrl ? { image: group.thumbnailUrl } : {}),
        ...(location ? { areaServed: location } : {}),
        memberOf: { "@id": `${CANONICAL_SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${groupUrl}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
          ...(categoryPath
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: categoryName,
                  item: `${CANONICAL_SITE_URL}${categoryPath}`,
                },
              ]
            : []),
          { "@type": "ListItem", position: categoryPath ? 3 : 2, name: group.name, item: groupUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <JsonLd data={jsonLd} />

      <div className="flex flex-col gap-3">
        <Breadcrumbs
          items={[
            { label: "Home", href: EXTERNAL_HOME_PATH },
            ...(categoryPath ? [{ label: categoryName, href: categoryPath }] : []),
            { label: group.name },
          ]}
        />
        <Link href={EXTERNAL_GROUPS_PATH} className="w-fit">
          <ArrowLeft className="size-3.5 shrink-0" />
          All groups
        </Link>
      </div>

      {isActive ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-10">
            <GroupSummary group={group} />
            <RelatedGroups group={group} related={related} />
          </div>
          <GroupAbout group={group} />
        </div>
      ) : (
        <NoData
          title="This group is temporarily unavailable"
          description="The listing owner or our moderation team has taken this group offline for now. Check back later."
        />
      )}
    </div>
  );
}
