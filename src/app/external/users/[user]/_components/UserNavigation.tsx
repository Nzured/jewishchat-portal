"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

function parseUserId(raw: string) {
  const match = raw.match(/^(.*?)(\d+)$/);
  if (!match) return { prefix: raw, number: 1 };
  return { prefix: match[1], number: Number(match[2]) };
}

export default function UserNavigation() {
  const router = useRouter();
  const params = useParams<{ user: string }>();
  const { prefix, number } = parseUserId(params.user);

  const hasPrevious = number > 1;

  return (
    <div className="flex items-center justify-between">
      <Button
        leftIcon={<ArrowLeft className="size-4" />}
        size="sm"
        variant="outline"
        onClick={() => router.push("/external/users")}
      >
        Back to Users
      </Button>

      <div className="flex items-center gap-1">
        <Button
          leftIcon={<ChevronLeft className="size-4" />}
          size="sm"
          variant="outline"
          disabled={!hasPrevious}
          onClick={() => router.push(`/external/users/${prefix}${number - 1}`)}
        >
          Previous User
        </Button>
        <Button
          rightIcon={<ChevronRight className="size-4" />}
          size="sm"
          variant="outline"
          onClick={() => router.push(`/external/users/${prefix}${number + 1}`)}
        >
          Next User
        </Button>
      </div>
    </div>
  );
}
