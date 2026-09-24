"use client";

import { LoadFailed } from "@/components/ui/LoadFailed";

export function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <LoadFailed
      title="We couldn't load your dashboard"
      description="Something went wrong while fetching your figures. Please try again."
      onRetry={onRetry}
    />
  );
}
