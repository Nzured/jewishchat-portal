import { ExternalLink } from "lucide-react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { getGroupPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";

interface RelatedGroupsProps {
  group: Group;
  related?: Group[];
  className?: string;
}

export function RelatedGroups({ group, related, className }: RelatedGroupsProps) {
  const categoryName = group.mainCategory?.name;

  if (!related?.length) return null;

  return (
    <Card className={cn("gap-3", className)}>
      <Typography
        variant="xs"
        className="px-(--card-spacing) font-mono tracking-[1.5px] text-ink-4 uppercase"
      >
        More in {categoryName}
      </Typography>

      <div className="flex flex-col divide-y divide-surface-line px-(--card-spacing)">
        {related?.map((item) => (
          <NextLink
            key={item.uuid}
            href={getGroupPath(item)}
            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-brand-softer focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
          >
            <Avatar
              variant="tile"
              size="md"
              src={item.thumbnailUrl ?? undefined}
              name={item.name}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Typography variant="small" className="truncate font-semibold text-ink-1">
                {item.name}
              </Typography>
              <Typography variant="xs" className="text-ink-3">
                {item.memberCount?.toLocaleString()} members
              </Typography>
            </div>
            <ExternalLink className="size-4 shrink-0 text-brand-green" />
          </NextLink>
        ))}
      </div>
    </Card>
  );
}
