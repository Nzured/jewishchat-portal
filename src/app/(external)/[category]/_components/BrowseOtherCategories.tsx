import NextLink from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Typography } from "@/components/ui/Typography";
import { categoryColorClasses } from "@/lib/categoryColor";
import { getCategoryPath } from "@/lib/publicPaths";
import { getCachedCategories } from "@/services/group/categories";

const MAX_CATEGORIES = 6;

export async function BrowseOtherCategories({ currentSlug }: { currentSlug: string }) {
  const categories = await getCachedCategories();

  const others = categories
    .filter((category) => category.slug !== currentSlug)
    .sort((a, b) => (b.groupsCount ?? 0) - (a.groupsCount ?? 0))
    .slice(0, MAX_CATEGORIES);

  if (others.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <Typography as="h2" variant="large" className="text-ink-1">
        Browse other categories
      </Typography>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:snap-none sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {others.map((category) => (
          <NextLink
            key={category.id}
            href={getCategoryPath(category.slug)}
            className="flex shrink-0 snap-start items-center gap-2.5 rounded-xl border border-surface-line bg-surface-card px-3 py-2.5 transition-colors hover:border-brand-green/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${categoryColorClasses(category.color, category.slug || category.icon)}`}
            >
              <Icon name={category.icon} className="size-4" />
            </span>

            <Typography as="span" variant="small" className="font-medium text-ink-1">
              {category.name}
            </Typography>

            {category.groupsCount !== undefined && (
              <Typography as="span" variant="xs" className="text-ink-4">
                {category.groupsCount.toLocaleString()}
              </Typography>
            )}
          </NextLink>
        ))}
      </div>
    </section>
  );
}
