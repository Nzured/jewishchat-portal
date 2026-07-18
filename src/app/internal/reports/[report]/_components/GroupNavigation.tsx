"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

function parseGroupId(raw: string) {
  const match = raw.match(/^(.*?)(\d+)$/);
  if (!match) return { prefix: raw, number: 1 };
  return { prefix: match[1], number: Number(match[2]) };
}

export default function GroupNavigation() {
  const router = useRouter();
  const params = useParams<{ report: string }>();
  const { prefix, number } = parseGroupId(params.report);

  const hasPrevious = number > 1;

  const goToGroup = (targetNumber: number) => {
    router.push(`/external/reports/${prefix}${targetNumber}`);
  };

  const handlePrevious = () => {
    if (!hasPrevious) return;
    goToGroup(number - 1);
  };

  const handleNext = () => {
    goToGroup(number + 1);
  };

  return (
    <div className="flex flex-row justify-between">
      <Button
        leftIcon={<ArrowLeft />}
        size={"sm"}
        variant={"outline"}
        onClick={handlePrevious}
        disabled={!hasPrevious}
      >
        Previous Group
      </Button>
      <Button rightIcon={<ArrowRight />} size={"sm"} variant={"outline"} onClick={handleNext}>
        Next Group
      </Button>
    </div>
  );
}
