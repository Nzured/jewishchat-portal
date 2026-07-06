"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    // Ensure value is bounded between 0 and max
    const boundedValue = Math.min(Math.max(value, 0), max);
    const percentage = (boundedValue / max) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={boundedValue}
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full bg-brand-soft",
          className,
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-brand-green transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
