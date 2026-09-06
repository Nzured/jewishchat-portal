import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

const bannerVariants = cva(
  "flex w-full items-start gap-3 rounded-lg border border-surface-line-strong p-3",
  {
    variants: {
      variant: {
        success: "bg-state-bg-success",
        info: "bg-state-bg-info",
        warning: "bg-state-bg-warning",
        error: "bg-state-bg-error",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

const bannerIconVariants = cva("mt-0.5 shrink-0 [&_svg]:size-4 mt-1", {
  variants: {
    variant: {
      success: "text-state-success",
      info: "text-state-info",
      warning: "text-state-warn",
      error: "text-state-error",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

type BannerVariant = VariantProps<typeof bannerVariants>["variant"];

interface BannerProps extends Omit<React.ComponentProps<"div">, "title"> {
  variant?: BannerVariant;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

function Banner({
  className,
  variant = "info",
  icon,
  title,
  description,
  children,
  ...props
}: BannerProps) {
  return (
    <div data-slot="banner" className={cn(bannerVariants({ variant }), className)} {...props}>
      {icon && <span className={cn(bannerIconVariants({ variant }))}>{icon}</span>}
      <div className="flex flex-1 flex-row gap-2">
        <div className="flex flex-1 flex-col gap-0.5">
          {title && (
            <Typography
              as="p"
              variant="small"
              data-slot="banner-title"
              className="font-semibold text-ink-1"
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography as="p" variant="xs" data-slot="banner-description" className="text-ink-3">
              {description}
            </Typography>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export { Banner, bannerVariants };
export type { BannerVariant };
