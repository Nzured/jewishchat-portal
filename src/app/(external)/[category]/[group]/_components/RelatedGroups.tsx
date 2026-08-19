import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { getGroupPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";

interface RelatedGroupsProps {
  group: Group;
  related: Group[];
  className?: string;
}

// FR-SEO-IL-03 — server-rendered so these links are in the initial HTML for
// crawlers, not added after the fact by client JS. The list itself comes
// straight from the backend's /related endpoint — already prioritized, with
// suspended/broken-link groups excluded, so it's rendered as-is.
export function RelatedGroups({ group, related, className }: RelatedGroupsProps) {
  const categoryName = group.mainCategory?.name;

  if (related.length === 0) return null;

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <Typography variant="xs" className="font-mono tracking-[1.5px] text-ink-4 uppercase">
        More in {categoryName}
      </Typography>

      <div className="flex flex-col">
        {related.map((item) => (
          <NextLink
            key={item.uuid}
            href={getGroupPath(item)}
            className="flex items-center gap-3 rounded-xl border-t border-surface-line px-2 py-3 transition-colors first:border-t-0 hover:bg-brand-softer focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
          >
            <Avatar
              variant="tile"
              size="md"
              src={item.thumbnailUrl ?? undefined}
              name={item.name}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Typography variant="small" className="truncate font-semibold text-ink-1">
                {item.name}
              </Typography>
              <Typography variant="xs" className="text-ink-3">
                {item.memberCount?.toLocaleString()} members
              </Typography>
            </div>
          </NextLink>
        ))}
      </div>
    </section>
  );
}
