"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { Link } from "@/components/ui/Link";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { Group } from "@/types/Group";
import { GroupAbout } from "./_components/GroupAbout";
import { GroupSummary } from "./_components/GroupSummary";
import { RelatedGroups } from "./_components/RelatedGroups";
import { useGroups } from "../_context/GroupsContext";

function GroupDetailsSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col gap-5">
        <Skeleton className="size-15 rounded-2xl" />
        <Skeleton className="h-9 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-md" />
        <Skeleton className="h-12 w-44 rounded-xl" />
        <Skeleton className="h-7 w-2/3 rounded-full" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-[68px] w-64 rounded-2xl" />
      </div>
    </div>
  );
}

function GroupPageContent({ slug }: { slug: string }) {
  const { fetchGroupBySlug } = useGroups();
  const [group, setGroup] = React.useState<Group | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    fetchGroupBySlug(slug)
      .then((res) => {
        if (!ignore) setGroup(res);
      })
      .catch(() => {
        if (!ignore) setGroup(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [fetchGroupBySlug, slug]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <Link href={EXTERNAL_GROUPS_PATH} className="w-fit">
        <ArrowLeft className="size-3.5 shrink-0" />
        All groups
      </Link>

      {isLoading ? (
        <GroupDetailsSkeleton />
      ) : !group ? (
        <NoData
          title="Group not found"
          description="This group may have been removed or the link is no longer valid."
        />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-10">
            <GroupSummary group={group} />
            <RelatedGroups group={group} />
          </div>
          <GroupAbout group={group} />
        </div>
      )}
    </div>
  );
}

export default function GroupPage() {
  const params = useParams<{ group: string }>();
  return <GroupPageContent key={params.group} slug={params.group} />;
}
