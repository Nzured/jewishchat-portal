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
import { formatLocation } from "@/lib/location";
import { getCategoryPath, getGroupPath } from "@/lib/publicPaths";
import { GroupService } from "@/services/group/group.service";
import { resolveSeoRedirect } from "@/services/seo/seo.service";
import { GroupStatus } from "@/types/Group";
import { GroupAbout } from "./_components/GroupAbout";
import { GroupAdminCard } from "./_components/GroupAdminCard";
import { GroupHeader } from "./_components/GroupHeader";
import { GroupStatsCard } from "./_components/GroupStatsCard";
import { GroupViewTracker } from "./_components/GroupViewTracker";
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
  const canonicalCategory = group.mainCategory?.slug;
  if (canonicalCategory && canonicalCategory !== category) return {};
  const categoryName = group.mainCategory?.name ?? "";
  const isActive = group.status === GroupStatus.ACTIVE;
  const title = `${group.name} - ${categoryName} Group | ChatList`;
  const description =
    `${group.shortDesc ?? ""} Join this ${categoryName} WhatsApp group on ChatList.`.trim();
  const path = getGroupPath(group);
  const image = group.thumbnailUrl || `${CANONICAL_SITE_URL}/svgs/logo.svg`;

  return {
    title,
    description,
    alternates: { canonical: path },
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

  if (RESERVED_ROUTE_SLUGS.includes(category)) {
    notFound();
  }

  const group = await findGroup(category, slug);
  if (!group) {
    const canonicalPath = await resolveSeoRedirect(`${category}/${slug}`);
    if (canonicalPath) {
      permanentRedirect(`/${canonicalPath}`);
    }
    notFound();
  }

  const canonicalCategory = group.mainCategory?.slug;
  if (canonicalCategory && canonicalCategory !== category) {
    permanentRedirect(getGroupPath(group));
  }
  const isActive = group.status === GroupStatus.ACTIVE;
  const related = isActive ? await findRelated(group.uuid) : [];
  const categoryName = group.mainCategory?.name ?? "";
  const categoryPath = canonicalCategory ? getCategoryPath(canonicalCategory) : null;
  const groupPath = getGroupPath(group);
  const groupUrl = `${CANONICAL_SITE_URL}${groupPath}`;
  const location = formatLocation(group);
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

  if (!isActive) {
    <NoData
      title="This group is temporarily unavailable"
      description="The listing owner or our moderation team has taken this group offline for now. Check back later."
    />;
  }

  return (
    <div className=" flex w-full flex-col gap-8">
      <JsonLd data={jsonLd} />
      {isActive && <GroupViewTracker group={group} />}
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
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <GroupHeader group={group} />
          <GroupAbout group={group} />
        </div>
        <aside className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
          <GroupAdminCard group={group} />
          <GroupStatsCard group={group} />
          <RelatedGroups group={group} related={related} />
        </aside>
      </div>
    </div>
  );
}
