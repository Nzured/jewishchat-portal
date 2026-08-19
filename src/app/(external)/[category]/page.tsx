import { cache } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { UnderConstruction } from "@/components/ui/UnderConstruction";
import { CANONICAL_SITE_URL, EXTERNAL_HOME_PATH, RESERVED_ROUTE_SLUGS } from "@/configs/const";
import { getCategoryPath } from "@/lib/publicPaths";
import { GroupService } from "@/services/group/group.service";
import { isCategoryIndexable, resolveSeoRedirect } from "@/services/seo/seo.service";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Shared between generateMetadata and the page body so both hit the same
// cached call within a single request instead of fetching the list twice.
const findCategory = cache(async (slug: string) => {
  const res = await GroupService.getCategories();
  return (res.data ?? []).find((category) => category.slug === slug) ?? null;
});

// FR-SEO-META-06 — cached per-request alongside findCategory.
const checkIndexable = cache((slug: string) => isCategoryIndexable(slug));

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
    // The backend's real per-category signal, per FR-SEO-META-06 — but this
    // page still has no real listing content (see the component below), so
    // it stays effectively noindex regardless until that ships.
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

  // FR-SEO-URL-06 — a category slug must never shadow a real system route.
  if (RESERVED_ROUTE_SLUGS.includes(slug)) {
    notFound();
  }

  const category = await findCategory(slug).catch(() => null);
  if (!category) {
    // FR-SEO-URL-02/09/10 — the category may have been renamed; check the
    // backend's redirect table before giving up and rendering a real 404.
    const canonicalPath = await resolveSeoRedirect(slug);
    if (canonicalPath) {
      permanentRedirect(`/${canonicalPath}`);
    }
    notFound();
  }

  const path = getCategoryPath(slug);
  const breadcrumbId = `${CANONICAL_SITE_URL}${path}/#breadcrumb`;

  // CollectionPage + ItemList (Section 5.2) and FAQPage (FR-SEO-AEO-05) are
  // intentionally not emitted yet — this page has no real group listing or
  // Q&A copy to describe, and FR-SEO-SD-03 rules out describing content
  // that isn't actually present. BreadcrumbList is real regardless of that.
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
        items={[{ label: "Home", href: EXTERNAL_HOME_PATH }, { label: category.name }]}
      />
      <UnderConstruction
        title="This category page is under construction"
        description="We're still building the category view. In the meantime, use Browse groups to see every group in this category."
      />
    </div>
  );
}
