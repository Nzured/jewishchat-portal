import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function ProfileHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="size-15 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-48 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-44" />
      </div>
    </div>
  );
}

const DETAIL_ROW_COUNT = 5;

function DetailRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProfileDetailsSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-24" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col divide-y divide-surface-line rounded-xl border border-surface-line bg-surface-card">
        {Array.from({ length: DETAIL_ROW_COUNT }).map((_, index) => (
          <DetailRowSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

const STAT_COUNT = 4;

export function ProfileGroupCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-line bg-surface-card p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="grid grid-cols-2 gap-3 border-t border-surface-line pt-3 sm:grid-cols-4">
        {Array.from({ length: STAT_COUNT }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-10" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-surface-line pt-3">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
