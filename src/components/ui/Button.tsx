import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[12px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none cursor-pointer focus-visible:border-brand-green focus-visible:ring-3 focus-visible:ring-brand-green/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-state-danger aria-invalid:ring-3 aria-invalid:ring-state-danger/20 dark:aria-invalid:border-state-danger/50 dark:aria-invalid:ring-state-danger/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "text-white",
        outline:
          "text-[12px] border-surface-line bg-surface-card hover:bg-brand-soft hover:text-ink-1 aria-expanded:bg-brand-soft aria-expanded:text-ink-1 disabled:opacity-50 [&_svg]:text-ink-3 hover:[&_svg]:text-ink-1 aria-expanded:[&_svg]:text-ink-1",
        secondary: "border-surface-line bg-white",
        icon: "hover:bg-brand-green/10 hover:text-brand-green aria-expanded:bg-brand-green/10 aria-expanded:text-brand-green dark:hover:bg-brand-green/20 disabled:opacity-50",
        link: "text-brand-green underline-offset-4 hover:underline disabled:opacity-50",
      },
      color: {
        primary: "",
        warning: "",
        info: "",
        danger: "",
      },
      size: {
        default: "h-[48px] gap-1.5 px-6",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        sm: "h-[40px] gap-1 px-2.5",
        lg: "h-9 gap-1.5",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        color: "primary",
        class: "bg-state-success hover:bg-state-success/90 disabled-primary-bg",
      },
      {
        variant: "default",
        color: "warning",
        class:
          "bg-state-warn hover:bg-state-warn/90 disabled:bg-state-bg-warning border border-surface-line",
      },
      {
        variant: "default",
        color: "info",
        class: "bg-state-info hover:bg-state-info/90 disabled:bg-state-bg-info",
      },
      {
        variant: "default",
        color: "danger",
        class: "bg-state-danger hover:bg-state-danger/90 disabled:bg-state-bg-error",
      },
      {
        variant: "secondary",
        color: "primary",
        class: "text-brand-deep hover:bg-state-bg-success disabled:bg-state-bg-success",
      },
      {
        variant: "secondary",
        color: "warning",
        class: "text-state-warn hover:bg-state-bg-warning disabled:bg-state-bg-warning",
      },
      {
        variant: "secondary",
        color: "info",
        class: "text-state-info hover:bg-state-bg-info disabled:bg-state-bg-info",
      },
      {
        variant: "secondary",
        color: "danger",
        class: "text-state-error hover:bg-state-bg-error disabled:bg-state-bg-error",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      color: "primary",
    },
  },
);

const iconStartClasses: Partial<
  Record<NonNullable<VariantProps<typeof buttonVariants>["size"]>, string>
> = {
  default: "",
  xs: "",
  sm: "gap-2",
  lg: "",
};

const iconEndClasses: Partial<
  Record<NonNullable<VariantProps<typeof buttonVariants>["size"]>, string>
> = {
  default: "pr-2",
  xs: "pr-1.5",
};

function Button({
  className,
  variant = "default",
  size = "default",
  color = "primary",
  asChild = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-color={color}
      className={cn(
        buttonVariants({ variant, size, color }),
        leftIcon && "justify-start",
        leftIcon && iconStartClasses[size ?? "default"],
        rightIcon && iconEndClasses[size ?? "default"],
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {leftIcon && (
            <span data-icon="inline-start" className="inline-flex items-center">
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span data-icon="inline-end" className="inline-flex items-center">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
