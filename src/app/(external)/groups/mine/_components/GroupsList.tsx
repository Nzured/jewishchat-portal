"use client";

import * as React from "react";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { Group, GroupDraft } from "@/types/Group";
import MyGroupCard from "./MyGroupCard";
import type { MyGroupsTab } from "./Header";

const SKELETON_COUNT = 6;
const LOAD_MORE_SKELETON_COUNT = 3;

interface GroupsListProps {
  activeTab: MyGroupsTab;
  groups: Group[];
  drafts: GroupDraft[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDraftDeleted: (draftId: string) => void;
  onGroupDeleted: (uuid: string) => void;
}

export default function GroupsList({
  activeTab,
  groups,
  drafts,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onDraftDeleted,
  onGroupDeleted,
}: GroupsListProps) {
  const isDraftTab = activeTab === "draft";
  const visibleDrafts = isDraftTab ? drafts : [];
  const visibleGroups = isDraftTab ? [] : groups;
  const canLoadMore = !isDraftTab && hasMore;

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const revealedCount = React.useRef(0);
  const reducedRef = React.useRef(false);
  const revealedTab = React.useRef(activeTab);
  const onLoadMoreRef = React.useRef(onLoadMore);

  React.useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  React.useEffect(() => {
    if (!canLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [canLoadMore, groups.length]);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        reducedRef.current = reduced;
      },
    );
    return () => mm.revert();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (revealedTab.current !== activeTab) {
      revealedTab.current = activeTab;
      revealedCount.current = 0;
    }

    const cards = Array.from(list.querySelectorAll<HTMLElement>(":scope > [data-group-card]"));
    const fresh = cards.slice(revealedCount.current);
    if (fresh.length === 0) return;
    revealedCount.current = cards.length;

    if (reducedRef.current) {
      gsap.set(fresh, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      fresh,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" },
    );

    return () => {
      tween.kill();
    };
  }, [groups, drafts, activeTab, isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-[84px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (visibleGroups.length === 0 && visibleDrafts.length === 0) {
    return <NoData description="You haven't created any groups yet." />;
  }

  return (
    <div ref={listRef} className="flex flex-col gap-3 mt-4">
      {visibleDrafts.map((draft) => (
        <div key={draft.draftId} data-group-card>
          <MyGroupCard item={{ kind: "draft", draft }} onDraftDeleted={onDraftDeleted} />
        </div>
      ))}
      {visibleGroups.map((group) => (
        <div key={group.uuid} data-group-card>
          <MyGroupCard item={{ kind: "group", group }} onGroupDeleted={onGroupDeleted} />
        </div>
      ))}

      {canLoadMore && (
        <div ref={sentinelRef} className="flex min-h-px flex-col gap-3">
          {isLoadingMore &&
            Array.from({ length: LOAD_MORE_SKELETON_COUNT }).map((_, index) => (
              <Skeleton key={index} className="h-[84px] rounded-2xl" />
            ))}
        </div>
      )}
    </div>
  );
}
