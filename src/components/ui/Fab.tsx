"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FabProps extends Omit<React.ComponentProps<typeof Button>, "size" | "variant"> {
  icon: React.ReactNode;
}

function Fab({ icon, className, ...props }: FabProps) {
  return (
    <Button
      type="button"
      variant="default"
      className={cn(
        "fixed right-5 bottom-5 z-40 size-14 rounded-full p-0 shadow-lg md:hidden",
        className,
      )}
      {...props}
    >
      {icon}
    </Button>
  );
}

export { Fab };
