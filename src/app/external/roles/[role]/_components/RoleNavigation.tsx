"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ALL_ROLES } from "../../_components/roleData";

export default function RoleNavigation() {
  const router = useRouter();
  const params = useParams<{ role: string }>();
  const currentIndex = Math.max(
    ALL_ROLES.findIndex((r) => r.role === params.role),
    0,
  );

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < ALL_ROLES.length - 1;

  return (
    <div className="flex items-center justify-between">
      <Button
        leftIcon={<ArrowLeft className="size-4" />}
        size="sm"
        variant="outline"
        onClick={() => router.push("/external/roles")}
      >
        Back to Roles
      </Button>

      <div className="flex items-center gap-1">
        <Button
          leftIcon={<ChevronLeft className="size-4" />}
          size="sm"
          variant="outline"
          disabled={!hasPrevious}
          onClick={() => router.push(`/external/roles/${ALL_ROLES[currentIndex - 1].role}`)}
        >
          Previous Role
        </Button>
        <Button
          rightIcon={<ChevronRight className="size-4" />}
          size="sm"
          variant="outline"
          disabled={!hasNext}
          onClick={() => router.push(`/external/roles/${ALL_ROLES[currentIndex + 1].role}`)}
        >
          Next Role
        </Button>
      </div>
    </div>
  );
}
