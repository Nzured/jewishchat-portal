import NextLink from "next/link";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  /** Omitted on the current (last) page — it renders as plain text, not a link. */
  href?: string;
}

// FR-SEO-IL-02 — every indexable page's BreadcrumbList JSON-LD needs a
// matching visible trail; schema with no on-page equivalent doesn't count.
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <NextLink
                href={item.href}
                className="text-xs text-ink-3 transition-colors hover:text-brand-green"
              >
                {item.label}
              </NextLink>
            ) : (
              <Typography
                as="span"
                variant="xs"
                className={isLast ? "text-ink-2" : "text-ink-3"}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </Typography>
            )}
            {!isLast && (
              <span aria-hidden="true" className="text-xs text-ink-4">
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
