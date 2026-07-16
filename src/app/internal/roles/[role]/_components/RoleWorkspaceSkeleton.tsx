import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

const PERMISSION_SKELETON_ROWS = 6;

export function RoleWorkspaceSkeleton() {
  return (
    <div className="mt-2 flex flex-row gap-6">
      <div className="flex flex-3 flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>

        <Skeleton className="h-[46px] w-full" />

        <div className="flex flex-col gap-3">
          {Array.from({ length: PERMISSION_SKELETON_ROWS }).map((_, index) => (
            <Card key={index} size="sm">
              <CardContent className="flex items-center justify-between gap-4">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-5 w-9 shrink-0 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <Card size="sm">
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-3 w-24" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-[46px] w-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
