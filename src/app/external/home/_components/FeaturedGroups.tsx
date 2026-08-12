"use client";

import * as React from "react";
import { GroupCard } from "@/app/external/groups/_components/GroupCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useReveal } from "@/lib/motion/useReveal";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";
import { useHome } from "../_context/HomeContext";

const MAX_VISIBLE_GROUPS = 5;

function FeaturedGroupsGrid({ groups }: { groups: Group[] }) {
  const gridRef = useReveal<HTMLDivElement>({ selector: ":scope > *", y: 24, stagger: 0.06 });

  return (
    <div
      ref={gridRef}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-3"
    >
      {groups?.map((group, index) => (
        <GroupCard
          key={group.uuid}
          group={group}
          className={cn(
            "w-[80vw] max-w-[360px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink",
            index === 0 && "sm:col-span-2 xl:col-span-2",
          )}
        />
      ))}
    </div>
  );
}

export function FeaturedGroups() {
  const { groups, isLoading } = useHome();
  const visibleGroups = groups.slice(0, MAX_VISIBLE_GROUPS);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: MAX_VISIBLE_GROUPS }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn("h-[132px] rounded-2xl", index === 0 && "sm:col-span-2 xl:col-span-2")}
          />
        ))}
      </div>
    );
  }

  return <FeaturedGroupsGrid groups={visibleGroups} />;
}
