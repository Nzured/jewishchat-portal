import { ChevronRight } from "lucide-react";
import NextLink from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Typography } from "@/components/ui/Typography";
import { categoryColorClasses } from "@/lib/categoryColor";
import { getCategoryPath } from "@/lib/publicPaths";
import { CategoryColor } from "@/types/Category";

interface CategoryListCardProps {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  count?: number;
  color?: CategoryColor;
}

function formatGroupCount(count?: number): string {
  const value = count ?? 0;
  return `${value.toLocaleString()} ${value === 1 ? "group" : "groups"}`;
}

export function CategoryListCard({
  name,
  slug,
  icon,
  description,
  count,
  color,
}: CategoryListCardProps) {
  return (
    <NextLink
      href={getCategoryPath(slug)}
      className="flex items-center gap-4 rounded-2xl border border-surface-line bg-surface-card p-5 transition-colors hover:border-brand-green/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
    >
      {icon && (
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${categoryColorClasses(color, slug || icon)}`}
        >
          <Icon name={icon} className="size-5" />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Typography as="span" variant="small" className="truncate font-semibold text-ink-1">
          {name}
        </Typography>
        <Typography variant="xs" className="text-ink-4">
          {formatGroupCount(count)}
        </Typography>
        <Typography
          variant="xs"
          className={description ? "mt-1.5 text-ink-3" : "mt-1.5 text-ink-4"}
        >
          {description || "No description added"}
        </Typography>
      </div>

      <ChevronRight className="size-4 shrink-0 text-ink-4" />
    </NextLink>
  );
}
