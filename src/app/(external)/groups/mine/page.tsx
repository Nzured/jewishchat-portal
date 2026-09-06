"use client";

import * as React from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, EXTERNAL_HOME_PATH } from "@/configs/const";
import { GroupService } from "@/services/group/group.service";
import { Group, GroupDraft } from "@/types/Group";
import GroupsList from "./_components/GroupsList";
import Header, { type MyGroupsTab } from "./_components/Header";

export default function MyGroupsPage() {
  const [activeTab, setActiveTab] = React.useState<MyGroupsTab>("groups");
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [drafts, setDrafts] = React.useState<GroupDraft[]>([]);
  const [totalGroups, setTotalGroups] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const pageRef = React.useRef(DEFAULT_PAGE);

  React.useEffect(() => {
    let ignore = false;
    pageRef.current = DEFAULT_PAGE;

    GroupService.getMyGroups(DEFAULT_PAGE, DEFAULT_PAGE_SIZE)
      .then((res) => {
        if (ignore) return;
        setGroups(res?.data?.groups ?? []);
        setDrafts(res?.data?.drafts ?? []);
        setTotalGroups(res?.data?.totalGroups ?? 0);
      })
      .catch(() => {
        if (ignore) return;
        setGroups([]);
        setDrafts([]);
        setTotalGroups(0);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const hasMore = groups.length < totalGroups;

  const handleDraftDeleted = React.useCallback((draftId: string) => {
    setDrafts((prev) => prev.filter((draft) => draft.draftId !== draftId));
  }, []);

  const handleGroupDeleted = React.useCallback((uuid: string) => {
    setGroups((prev) => prev.filter((group) => group.uuid !== uuid));
    setTotalGroups((prev) => Math.max(prev - 1, 0));
  }, []);

  const loadMore = React.useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const nextPage = pageRef.current + 1;
    setIsLoadingMore(true);

    GroupService.getMyGroups(nextPage, DEFAULT_PAGE_SIZE)
      .then((res) => {
        pageRef.current = nextPage;
        const incoming = res?.data?.groups ?? [];
        setGroups((prev) => {
          const seen = new Set(prev.map((group) => group.uuid));
          return [...prev, ...incoming.filter((group) => !seen.has(group.uuid))];
        });
        setTotalGroups(res?.data?.totalGroups ?? 0);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [isLoading, isLoadingMore, hasMore]);

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Home", href: EXTERNAL_HOME_PATH }, { label: "My Listings" }]}
      />
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        groupCount={totalGroups}
        draftCount={drafts.length}
      />
      <GroupsList
        activeTab={activeTab}
        groups={groups}
        drafts={drafts}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onDraftDeleted={handleDraftDeleted}
        onGroupDeleted={handleGroupDeleted}
      />
    </>
  );
}
