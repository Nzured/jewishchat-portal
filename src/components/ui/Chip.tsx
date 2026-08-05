import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-start gap-1.5 border px-3 py-1.5 text-sm font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        filter: "",
        count: "cursor-default",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-lg",
      },
      type: {
        neutral: "border-surface-line-strong bg-surface-card text-ink-3",
        error: "border-surface-line-strong bg-state-bg-error text-state-danger",
        warning: "border-surface-line-strong bg-state-bg-warning text-state-warn",
        success: "border-surface-line-strong bg-state-bg-success text-state-success",
        info: "border-surface-line-strong bg-state-bg-info text-state-info",
      },
    },
    defaultVariants: {
      variant: "filter",
      shape: "pill",
      type: "neutral",
    },
  },
);

interface FilterChipProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    Omit<VariantProps<typeof chipVariants>, "type"> {
  label: React.ReactNode;
  variant?: "filter";
  shape?: "pill" | "rounded";
  type?: "neutral" | "error" | "warning" | "success";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIconLabel?: string;
  onRightIconClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface CountChipProps
  extends React.HTMLAttributes<HTMLSpanElement>, Omit<VariantProps<typeof chipVariants>, "type"> {
  label: string;
  count?: number;
  variant?: "count";
  shape?: "pill" | "rounded";
  type?: "neutral" | "error" | "warning" | "success" | "info";
}

type ChipProps = FilterChipProps | CountChipProps;

function Chip({
  label,
  variant = "filter",
  shape = "pill",
  type = "neutral",
  className,
  ...props
}: ChipProps) {
  if (variant === "count") {
    const { count, ...rest } = props as CountChipProps;
    return (
      <span
        data-slot="chip"
        className={cn(chipVariants({ variant, shape, type, className }))}
        {...rest}
      >
        <Typography variant="xs" className="truncate font-medium tabular-nums text-inherit">
          {count?.toLocaleString()} {label}
        </Typography>
      </span>
    );
  }

  const {
    leftIcon,
    rightIcon,
    rightIconLabel,
    onRightIconClick,
    onClick,
    type: _,
    ...rest
  } = props as FilterChipProps;

  if (rightIcon) {
    return (
      <div
        data-slot="chip"
        className={cn(chipVariants({ variant, shape, type }), "gap-1 p-1", className)}
      >
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex items-center gap-1.5 rounded-full py-0.5 pl-2",
            onClick ? "cursor-pointer" : "cursor-default",
          )}
          {...rest}
        >
          {leftIcon && (
            <span className="flex size-4 shrink-0 items-center justify-center">{leftIcon}</span>
          )}
          {label}
        </button>
        <button
          type="button"
          aria-label={rightIconLabel}
          onClick={(event) => {
            event.stopPropagation();
            onRightIconClick?.(event);
          }}
          className="flex size-4 ml-1  shrink-0 cursor-pointer items-center justify-center rounded-full border border-current"
        >
          {rightIcon}
        </button>
      </div>
    );
  }

  return (
    <button
      data-slot="chip"
      type="button"
      onClick={onClick}
      className={cn(
        chipVariants({ variant, shape, type }),
        onClick
          ? type === "neutral"
            ? "cursor-pointer hover:bg-brand-soft active:bg-brand-soft/80"
            : "cursor-pointer hover:opacity-90 active:opacity-80"
          : "cursor-default",
        className,
      )}
      {...rest}
    >
      {leftIcon && (
        <span className="flex size-4 shrink-0 items-center justify-center">{leftIcon}</span>
      )}
      <Typography variant="xs" className="truncate font-medium tabular-nums text-inherit">
        {label}
      </Typography>
    </button>
  );
}

export { Chip, chipVariants };
export type { ChipProps };
