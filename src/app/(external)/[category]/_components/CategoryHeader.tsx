import { Globe, Users } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Typography } from "@/components/ui/Typography";
import { categoryColorClasses } from "@/lib/categoryColor";
import { CategoryDetail } from "@/types/Category";
import { CategorySearch } from "./CategorySearch";

function formatCount(count: number, singular: string, plural: string) {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

export function CategoryHeader({ category }: { category: CategoryDetail }) {
  const liveGroups = category.liveGroupsCount ?? category.groupsCount;
  const countries = category.countriesCount;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4 sm:gap-5">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl sm:size-16 ${categoryColorClasses(category.color, category.slug || category.icon)}`}
        >
          <Icon name={category.icon} className="size-6 sm:size-7" />
        </span>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Typography
            as="span"
            variant="xs"
            className="font-mono font-medium tracking-[1.5px] text-brand-green uppercase"
          >
            Category
          </Typography>

          <Typography
            as="h1"
            variant="h2"
            className="font-display text-2xl font-bold tracking-tight text-ink-1 sm:text-3xl"
          >
            {category.name}
          </Typography>

          {category.description && (
            <Typography variant="small" className="max-w-3xl text-ink-2">
              {category.description}
            </Typography>
          )}

          {(liveGroups !== undefined || countries !== undefined) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">
              {liveGroups !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Users className="size-4 text-ink-3" />
                  <Typography variant="small" className="text-ink-3">
                    {formatCount(liveGroups, "live group", "live groups")}
                  </Typography>
                </div>
              )}

              {countries !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Globe className="size-4 text-ink-3" />
                  <Typography variant="small" className="text-ink-3">
                    {formatCount(countries, "country", "countries")}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CategorySearch categoryName={category.name} categorySlug={category.slug} />
    </div>
  );
}
