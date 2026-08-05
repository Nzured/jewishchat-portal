"use client";

import * as React from "react";
import { useCharacterCount } from "@/hooks/useCharacterCount";
import { cn } from "@/lib/utils";

function Textarea({ className, maxLength, onChange, ...props }: React.ComponentProps<"textarea">) {
  const showCounter = typeof maxLength === "number";
  const { length, handleChange } = useCharacterCount<HTMLTextAreaElement>({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange,
  });

  const textarea = (
    <textarea
      data-slot="textarea"
      maxLength={maxLength}
      onChange={showCounter ? handleChange : onChange}
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-surface-line bg-surface-card px-2.5 py-2 text-base transition-colors outline-none placeholder:text-ink-4 focus-visible:border-brand-green disabled:cursor-not-allowed disabled:bg-surface-bg/50 disabled:opacity-50 aria-invalid:border-state-danger md:text-sm text-ink-1",
        className,
      )}
      {...props}
    />
  );

  if (!showCounter) {
    return textarea;
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {textarea}
      <span data-slot="textarea-counter" className="ml-auto text-xs text-ink-4 tabular-nums">
        {length}/{maxLength}
      </span>
    </div>
  );
}

export { Textarea };
