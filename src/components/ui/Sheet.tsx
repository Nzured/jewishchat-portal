"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

const sheetSideClasses = {
  right:
    "inset-y-0 right-0 h-full w-full max-w-xs border-l data-open:slide-in-from-right data-closed:slide-out-to-right",
  left: "inset-y-0 left-0 h-full w-full max-w-xs border-r data-open:slide-in-from-left data-closed:slide-out-to-left",
} as const;

interface SheetContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  side?: keyof typeof sheetSideClasses;
}

function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  const childArray = React.Children.toArray(children);
  const header = childArray.find(
    (child) => React.isValidElement(child) && child.type === SheetHeader,
  );
  const body = childArray.filter((child) => child !== header);

  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex max-w-full flex-col overflow-hidden border-surface-line bg-surface-card shadow-xl outline-none",
          "data-open:animate-in data-closed:animate-out",
          sheetSideClasses[side],
          className,
        )}
        {...props}
      >
        {header && <div className="shrink-0">{header}</div>}
        <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-header" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof Typography>) {
  return (
    <DialogPrimitive.Title asChild>
      <Typography
        as="h2"
        variant="large"
        data-slot="sheet-title"
        className={cn("font-semibold text-ink-1", className)}
        {...props}
      />
    </DialogPrimitive.Title>
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof Typography>) {
  return (
    <DialogPrimitive.Description asChild>
      <Typography
        variant="small"
        data-slot="sheet-description"
        className={cn("text-ink-3", className)}
        {...props}
      />
    </DialogPrimitive.Description>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
