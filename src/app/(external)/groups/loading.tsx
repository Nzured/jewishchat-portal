import { Skeleton } from "@/components/ui/Skeleton";
import { GroupsGridSkeleton } from "./_components/GroupsDirectory";

export default function GroupsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-[74px] w-full rounded-[24px]" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="ml-auto h-8 w-28 rounded-lg" />
        </div>
      </div>
      <GroupsGridSkeleton />
    </div>
  );
}
