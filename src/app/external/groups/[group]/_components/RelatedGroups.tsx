"use client";

import * as React from "react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { DEFAULT_PAGE, EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { cn } from "@/lib/utils";
import { GroupService } from "@/services/group/group.service";
import { Group } from "@/types/Group";

interface RelatedGroupsProps {
  group: Group;
  className?: string;
}

const MAX_RELATED_GROUPS = 4;

export function RelatedGroups({ group, className }: RelatedGroupsProps) {
  const categorySlug = group.mainCategory?.slug;
  const categoryName = group.mainCategory?.name;

  const [related, setRelated] = React.useState<Group[]>([]);
  const [isLoading, setIsLoading] = React.useState(Boolean(categorySlug));

  React.useEffect(() => {
    if (!categorySlug) return;

    let ignore = false;

    async function fetchRelated() {
      try {
        // Over-fetch by one so dropping the current group still fills the list.
        const res = await GroupService.getAllGroups(
          "",
          "",
          categorySlug,
          DEFAULT_PAGE,
          MAX_RELATED_GROUPS + 1,
        );
        if (ignore) return;
        setRelated(
          (res?.data?.groups ?? [])
            .filter((item) => item.slug !== group.slug)
            .slice(0, MAX_RELATED_GROUPS),
        );
      } catch {
        if (!ignore) setRelated([]);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchRelated();

    return () => {
      ignore = true;
    };
  }, [categorySlug, group.slug]);

  if (!categorySlug || (!isLoading && related.length === 0)) return null;

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <Typography variant="xs" className="font-mono tracking-[1.5px] text-ink-4 uppercase">
        More in {categoryName}
      </Typography>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: MAX_RELATED_GROUPS }).map((_, index) => (
            <Skeleton key={index} className="h-[56px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          {related.map((item) => (
            <NextLink
              key={item.uuid}
              href={`${EXTERNAL_GROUPS_PATH}/${item.slug}`}
              className="flex items-center gap-3 rounded-xl border-t border-surface-line px-2 py-3 transition-colors first:border-t-0 hover:bg-brand-softer focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
            >
              <Avatar variant="tile" size="md" name={item.name} />
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
      )}
    </section>
  );
}
