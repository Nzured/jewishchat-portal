import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  CANONICAL_SITE_URL,
  DEFAULT_PAGE,
  EXTERNAL_CATEGORIES_PATH,
  EXTERNAL_HOME_PATH,
  RESERVED_ROUTE_SLUGS,
} from "@/configs/const";
import { getCategoryPath } from "@/lib/publicPaths";
import { GroupService } from "@/services/group/group.service";
import { isCategoryIndexable, resolveSeoRedirect } from "@/services/seo/seo.service";
import { BrowseOtherCategories } from "./_components/BrowseOtherCategories";
import { CategoryGroups } from "./_components/CategoryGroups";
import { CategoryHeader } from "./_components/CategoryHeader";
import {
  CATEGORY_GROUPS_DEFAULT_SORT,
  CATEGORY_GROUPS_PAGE_SIZE,
} from "./_components/groupsListing";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const findCategory = cache(async (slug: string) => {
  const res = await GroupService.getCategoryBySlug(slug);
  return res.data ?? null;
});

const checkIndexable = cache((slug: string) => isCategoryIndexable(slug));

const loadGroups = cache(async (slug: string) => {
  try {
    const res = await GroupService.getAllGroups(
      undefined,
      undefined,
      slug,
      DEFAULT_PAGE,
      CATEGORY_GROUPS_PAGE_SIZE,
      CATEGORY_GROUPS_DEFAULT_SORT,
    );
    return { groups: res.data?.groups ?? [], total: res.data?.totalElements ?? 0 };
  } catch {
    return { groups: [], total: 0 };
  }
});

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  if (RESERVED_ROUTE_SLUGS.includes(slug)) return {};

  const category = await findCategory(slug).catch(() => null);
  if (!category) return {};

  const title = `${category.name} WhatsApp Groups | ChatList`;
  const description = `Browse ${category.name} WhatsApp groups on ChatList. Find and join a community today.`;
  const path = getCategoryPath(slug);
  const indexable = await checkIndexable(slug);

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: [{ url: `${CANONICAL_SITE_URL}/svgs/logo.svg` }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [`${CANONICAL_SITE_URL}/svgs/logo.svg`],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;

  if (RESERVED_ROUTE_SLUGS.includes(slug)) {
    notFound();
  }

  const category = await findCategory(slug).catch(() => null);
  if (!category) {
    const canonicalPath = await resolveSeoRedirect(slug);
    if (canonicalPath) {
      permanentRedirect(`/${canonicalPath}`);
    }
    notFound();
  }

  const { groups, total } = await loadGroups(slug);

  const path = getCategoryPath(slug);
  const breadcrumbId = `${CANONICAL_SITE_URL}${path}/#breadcrumb`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${CANONICAL_SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "Categories",
            item: `${CANONICAL_SITE_URL}${EXTERNAL_CATEGORIES_PATH}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: `${CANONICAL_SITE_URL}${path}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: "Home", href: EXTERNAL_HOME_PATH },
          { label: "Categories", href: EXTERNAL_CATEGORIES_PATH },
          { label: category.name },
        ]}
      />
      <CategoryHeader category={category} />
      <CategoryGroups categorySlug={slug} initialGroups={groups} initialTotal={total} />
      <BrowseOtherCategories currentSlug={slug} />
    </div>
  );
}
