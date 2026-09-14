"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function InternalError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState reset={reset} homeHref="/internal" />;
}
