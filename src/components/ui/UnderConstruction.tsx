"use client";

import * as React from "react";
import underConstructionAnimation from "@public/animations/UnderConstruction.json";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

interface UnderConstructionProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
}

function UnderConstruction({
  className,
  title = "This page is under construction",
  description = "We're still building this out. Check back soon.",
  ...props
}: UnderConstructionProps) {
  return (
    <div
      data-slot="under-construction"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-surface-line-strong bg-surface-bg px-8 py-16 text-center",
        className,
      )}
      {...props}
    >
      <div className="">
        <Lottie animationData={underConstructionAnimation} loop={true} className="w-full h-full" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <Typography as="p" variant="h4" className="font-semibold text-ink-1">
          {title}
        </Typography>
        <Typography as="p" variant="p" className="max-w-sm text-ink-3">
          {description}
        </Typography>
      </div>
    </div>
  );
}

export { UnderConstruction };
