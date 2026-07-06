"use client";

import { Loader2 } from "lucide-react";
import { usePromiseTracker } from "react-promise-tracker";

export function GlobalLoader() {
  const { promiseInProgress } = usePromiseTracker();

  if (!promiseInProgress) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-4 bg-surface-card px-8 py-6 rounded-2xl shadow-xl border border-surface-line animate-in fade-in zoom-in-95 duration-200">
        <Loader2 className="h-10 w-10 animate-spin text-brand-green" />
        <span className="text-sm font-semibold tracking-wide text-ink-1 animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
}
