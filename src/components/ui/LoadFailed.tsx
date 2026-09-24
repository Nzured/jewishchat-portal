"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createLazyLottie } from "@/components/ui/LazyLottie";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

const LoadFailedAnimation = createLazyLottie(() => import("@/assets/animations/404 Error.json"));

interface LoadFailedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}

function LoadFailed({
  title = "Something went wrong",
  description = "We couldn't load this right now. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
  ...props
}: LoadFailedProps) {
  return (
    <div
      data-slot="load-failed"
      className={cn("flex flex-col items-center justify-center gap-1 py-10 text-center", className)}
      {...props}
    >
      <div className="w-full max-w-xs">
        <LoadFailedAnimation loop className="h-auto w-full" />
      </div>
      <Typography variant="h4" className="font-semibold text-ink-1">
        {title}
      </Typography>
      {description && (
        <Typography variant="small" className="max-w-sm text-ink-3">
          {description}
        </Typography>
      )}
      {onRetry && (
        <Button
          variant="secondary"
          color="primary"
          size="sm"
          leftIcon={<RotateCcw className="size-4" />}
          onClick={onRetry}
          className="mt-3"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export { LoadFailed };
