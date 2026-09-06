"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { typographyVariants, variantElementMap } from "./TypographyVariants";
import type { VariantProps } from "class-variance-authority";

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  asChild?: boolean;
  as?: React.ElementType;
  clampLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else ref.current = node;
    }
  };
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      className,
      variant = "p",
      as,
      asChild = false,
      clampLines,
      showMoreLabel = "Show more",
      showLessLabel = "Show less",
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : as || variantElementMap[variant ?? "p"];
    const [expanded, setExpanded] = React.useState(false);
    const [isTruncated, setIsTruncated] = React.useState(false);
    const clampRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
      const el = clampRef.current;
      if (!clampLines || expanded || !el) return;

      const checkTruncation = () => setIsTruncated(el.scrollHeight > el.clientHeight + 1);
      checkTruncation();

      const observer = new ResizeObserver(checkTruncation);
      observer.observe(el);
      return () => observer.disconnect();
    }, [clampLines, expanded, children]);

    if (!clampLines) {
      return (
        <Comp ref={ref} className={cn(typographyVariants({ variant, className }))} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <>
        <Comp
          ref={mergeRefs(ref, clampRef)}
          className={cn(typographyVariants({ variant, className }))}
          style={
            expanded
              ? undefined
              : {
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: clampLines,
                  overflow: "hidden",
                }
          }
          {...props}
        >
          {children}
        </Comp>
        {(isTruncated || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="cursor-pointer self-start text-sm font-medium text-brand-green hover:underline"
          >
            {expanded ? showLessLabel : showMoreLabel}
          </button>
        )}
      </>
    );
  },
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
