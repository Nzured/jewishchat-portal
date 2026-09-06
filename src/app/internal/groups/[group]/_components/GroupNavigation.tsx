"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAdminGroupContext } from "../../_context/AdminGroupContext";

export default function GroupNavigation() {
  const router = useRouter();
  const params = useParams<{ group: string }>();
  const { lastListedGroupIds } = useAdminGroupContext();

  const currentIndex = lastListedGroupIds.indexOf(params.group);
  const hasContext = currentIndex !== -1;
  const hasPrevious = hasContext && currentIndex > 0;
  const hasNext = hasContext && currentIndex < lastListedGroupIds.length - 1;

  return (
    <div className="sticky top-0 z-30 -mx-6 bg-surface-bg px-6 pt-8 pb-3 flex items-center justify-between gap-2">
      <Button
        leftIcon={<ArrowLeft className="size-4" />}
        size="sm"
        variant="outline"
        onClick={() => router.push("/internal/groups")}
      >
        Back to Listing
      </Button>

      {hasContext && (
        <div className="flex items-center gap-1">
          <Button
            leftIcon={<ChevronLeft className="size-4" />}
            size="sm"
            variant="outline"
            disabled={!hasPrevious}
            onClick={() => router.push(`/internal/groups/${lastListedGroupIds[currentIndex - 1]}`)}
          >
            <span className="hidden sm:inline">Previous Group</span>
            <span className="sm:hidden">Previous</span>
          </Button>
          <Button
            rightIcon={<ChevronRight className="size-4" />}
            size="sm"
            variant="outline"
            disabled={!hasNext}
            onClick={() => router.push(`/internal/groups/${lastListedGroupIds[currentIndex + 1]}`)}
          >
            <span className="hidden sm:inline">Next Group</span>
            <span className="sm:hidden">Next</span>
          </Button>
        </div>
      )}
    </div>
  );
}
