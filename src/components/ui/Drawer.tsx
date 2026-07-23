"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

function Drawer({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  const keyboardInset = useKeyboardInset();
  const isKeyboardOpen = keyboardInset > 0;
  const childArray = React.Children.toArray(children);
  const header = childArray.find(
    (child) => React.isValidElement(child) && child.type === DrawerHeader,
  );
  const body = childArray.filter((child) => child !== header);

  return (
    <DialogPrimitive.Portal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        style={{ ...style, "--kb-offset": `${keyboardInset}px` } as React.CSSProperties}
        className={cn(
          "fixed inset-x-0 bottom-[var(--kb-offset,0px)] z-50 flex max-h-[calc(85vh_-_var(--kb-offset,0px))] w-full flex-col overflow-hidden rounded-t-2xl border-t border-surface-line bg-surface-card shadow-xl outline-none",
          isKeyboardOpen && "max-h-[calc(100dvh_-_var(--kb-offset,0px))]",
          "data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom",
          className,
        )}
        {...props}
      >
        <div className="flex shrink-0 justify-center pt-2.5">
          <div className="h-1.5 w-10 rounded-full bg-surface-line-strong" aria-hidden="true" />
        </div>
        {header && <div className="shrink-0 px-4 pt-3 pb-2">{header}</div>}
        <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="drawer-header" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof Typography>) {
  return (
    <DialogPrimitive.Title asChild>
      <Typography
        as="h2"
        variant="large"
        data-slot="drawer-title"
        className={cn("font-semibold text-ink-1", className)}
        {...props}
      />
    </DialogPrimitive.Title>
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof Typography>) {
  return (
    <DialogPrimitive.Description asChild>
      <Typography
        variant="small"
        data-slot="drawer-description"
        className={cn("text-ink-3", className)}
        {...props}
      />
    </DialogPrimitive.Description>
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
};
