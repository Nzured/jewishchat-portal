"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createLazyLottie } from "@/components/ui/LazyLottie";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

const NoDataAnimation = createLazyLottie(() => import("@/assets/animations/NoData.json"));

interface NoDataProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Shows a "Clear filters" button that calls this when pressed. Omit to hide the button. */
  onClearFilters?: () => void;
}

function NoData({
  title = "No results found",
  description,
  onClearFilters,
  className,
  ...props
}: NoDataProps) {
  return (
    <div
      data-slot="no-data"
      className={cn("flex flex-col items-center justify-center gap-1 py-10 text-center", className)}
      {...props}
    >
      <div className="size-50">
        <NoDataAnimation loop className="h-full w-full" />
      </div>
      <Typography variant="h4" className="font-semibold text-ink-1">
        {title}
      </Typography>
      {description && (
        <Typography variant="small" className="max-w-sm text-ink-3">
          {description}
        </Typography>
      )}
      {onClearFilters && (
        <Button
          variant="secondary"
          color="primary"
          size="sm"
          leftIcon={<X className="size-4" />}
          onClick={onClearFilters}
          className="mt-3"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

export { NoData };
