import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-surface-line bg-surface-card px-2.5 py-2 text-base transition-colors outline-none placeholder:text-ink-4 focus-visible:border-brand-green disabled:cursor-not-allowed disabled:bg-surface-bg/50 disabled:opacity-50 aria-invalid:border-state-danger md:text-sm text-ink-1",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
