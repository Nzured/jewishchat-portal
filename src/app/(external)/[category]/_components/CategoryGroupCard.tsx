import { Lock, MapPin, Users } from "lucide-react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { formatCityRegion } from "@/lib/location";
import { getGroupPath } from "@/lib/publicPaths";
import { Group } from "@/types/Group";

export function CategoryGroupCard({ group }: { group: Group }) {
  const location = formatCityRegion(group);

  return (
    <NextLink
      href={getGroupPath(group)}
      className="flex flex-col gap-3 rounded-2xl border border-surface-line bg-surface-card p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/40"
    >
      <div className="flex items-start gap-3">
        <Avatar variant="tile" size="md" src={group.thumbnailUrl ?? undefined} name={group.name} />

        <Typography as="span" variant="small" className="min-w-0 flex-1 font-semibold text-ink-1">
          {group.name}
        </Typography>

        {group.linkVisibilityLoggedInOnly && (
          <Lock className="size-3.5 shrink-0 text-ink-4" aria-label="Link visible to members" />
        )}
      </div>

      {group.shortDesc && (
        <Typography variant="small" className="line-clamp-2 text-ink-3">
          {group.shortDesc}
        </Typography>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-surface-line pt-3">
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-ink-4" />
            <Typography as="span" variant="xs" className="text-ink-3">
              {location}
            </Typography>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 shrink-0 text-ink-4" />
          <Typography
            as="span"
            variant="xs"
            className={group.memberCount ? "text-ink-3" : "text-ink-4"}
          >
            {group.memberCount
              ? `${group.memberCount.toLocaleString()} members`
              : "Count not stated"}
          </Typography>
        </div>
      </div>
    </NextLink>
  );
}
