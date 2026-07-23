"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRoles } from "@/app/internal/roles/_context/RoleContext";
import { Button } from "@/components/ui/Button";

export default function RoleNavigation() {
  const router = useRouter();
  const params = useParams<{ role: string }>();
  const { roles } = useRoles();
  const currentIndex = Math.max(
    roles.findIndex((r) => r.id === Number(params.role)),
    0,
  );

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < roles.length - 1;

  return (
    <div className="flex items-center justify-between">
      <Button
        leftIcon={<ArrowLeft className="size-4" />}
        size="sm"
        variant="outline"
        onClick={() => router.push("/internal/roles")}
      >
        Back to Roles
      </Button>

      <div className="flex items-center gap-1">
        <Button
          leftIcon={<ChevronLeft className="size-4" />}
          size="sm"
          variant="outline"
          disabled={!hasPrevious}
          onClick={() => router.push(`/internal/roles/${roles[currentIndex - 1].id}`)}
        >
          Previous Role
        </Button>
        <Button
          rightIcon={<ChevronRight className="size-4" />}
          size="sm"
          variant="outline"
          disabled={!hasNext}
          onClick={() => router.push(`/internal/roles/${roles[currentIndex + 1].id}`)}
        >
          Next Role
        </Button>
      </div>
    </div>
  );
}
