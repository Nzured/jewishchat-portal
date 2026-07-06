"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

function Modal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="modal" {...props} />;
}

function ModalTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />;
}

function ModalClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="modal-close" {...props} />;
}

function ModalOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="modal-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

const modalIconVariants = cva(
  "flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5",
  {
    variants: {
      variant: {
        primary: "bg-state-bg-success text-state-success",
        warning: "bg-state-bg-warning text-state-warn",
        info: "bg-state-bg-info text-state-info",
        danger: "bg-state-bg-error text-state-danger",
        neutral: "bg-surface-bg text-ink-3",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type ModalVariant = VariantProps<typeof modalIconVariants>["variant"];

const ModalVariantContext = React.createContext<ModalVariant>("neutral");

interface ModalContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  variant?: ModalVariant;
  showClose?: boolean;
}

function ModalContent({
  className,
  variant = "neutral",
  showClose = true,
  children,
  ...props
}: ModalContentProps) {
  const childArray = React.Children.toArray(children);
  const header = childArray.find(
    (child) => React.isValidElement(child) && child.type === ModalHeader,
  );
  const footer = childArray.find(
    (child) => React.isValidElement(child) && child.type === ModalFooter,
  );
  const body = childArray.filter((child) => child !== header && child !== footer);

  return (
    <DialogPrimitive.Portal>
      <ModalOverlay />
      <DialogPrimitive.Content
        data-slot="modal-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-surface-line bg-surface-card shadow-xl outline-none",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {showClose && (
          <DialogPrimitive.Close
            data-slot="modal-close"
            className="absolute top-4 right-4 z-20 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-bg hover:text-ink-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-line-strong"
            aria-label="Close"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
        <ModalVariantContext.Provider value={variant}>
          {header && <div className="shrink-0 px-5 pt-5 pb-3">{header}</div>}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{body}</div>
          {footer}
        </ModalVariantContext.Provider>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

interface ModalHeaderProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode;
}

function ModalHeader({ className, icon, children, ...props }: ModalHeaderProps) {
  const variant = React.useContext(ModalVariantContext);

  if (!icon) {
    return (
      <div
        data-slot="modal-header"
        className={cn("flex flex-col gap-1 pr-8", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-slot="modal-header"
      className={cn("flex items-start gap-3 pr-8", className)}
      {...props}
    >
      <div className={cn(modalIconVariants({ variant }))}>{icon}</div>
      <div className="flex flex-col gap-1 pt-0.5">{children}</div>
    </div>
  );
}

function ModalTitle({ className, ...props }: React.ComponentProps<typeof Typography>) {
  return (
    <DialogPrimitive.Title asChild>
      <Typography
        as="h2"
        variant="large"
        data-slot="modal-title"
        className={cn("font-semibold text-ink-1", className)}
        {...props}
      />
    </DialogPrimitive.Title>
  );
}

function ModalDescription({ className, ...props }: React.ComponentProps<typeof Typography>) {
  return (
    <DialogPrimitive.Description asChild>
      <Typography
        variant="small"
        data-slot="modal-description"
        className={cn("text-ink-3", className)}
        {...props}
      />
    </DialogPrimitive.Description>
  );
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "shrink-0 px-5 py-4 border-t border-surface-line flex items-center justify-end gap-2 bg-surface-stale",
        className,
      )}
      {...props}
    />
  );
}

export {
  Modal,
  ModalTrigger,
  ModalClose,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
};
export type { ModalVariant };
