"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUserManagementContext } from "../../_context/UserManagementContext";

export default function UserNavigation() {
  const router = useRouter();
  const params = useParams<{ user: string }>();
  const { lastListedUserIds } = useUserManagementContext();

  const currentIndex = lastListedUserIds.indexOf(params.user);
  const hasContext = currentIndex !== -1;
  const hasPrevious = hasContext && currentIndex > 0;
  const hasNext = hasContext && currentIndex < lastListedUserIds.length - 1;

  return (
    <div className="flex items-center justify-between">
      <Button
        leftIcon={<ArrowLeft className="size-4" />}
        size="sm"
        variant="outline"
        onClick={() => router.push("/internal/users")}
      >
        Back to Users
      </Button>

      {hasContext && (
        <div className="flex items-center gap-1">
          <Button
            leftIcon={<ChevronLeft className="size-4" />}
            size="sm"
            variant="outline"
            disabled={!hasPrevious}
            onClick={() => router.push(`/internal/users/${lastListedUserIds[currentIndex - 1]}`)}
          >
            Previous User
          </Button>
          <Button
            rightIcon={<ChevronRight className="size-4" />}
            size="sm"
            variant="outline"
            disabled={!hasNext}
            onClick={() => router.push(`/internal/users/${lastListedUserIds[currentIndex + 1]}`)}
          >
            Next User
          </Button>
        </div>
      )}
    </div>
  );
}
