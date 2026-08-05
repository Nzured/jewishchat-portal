"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";
import { Switch } from "./Switch";
import { Typography } from "./Typography";

interface SwitchBannerProps extends Omit<
  React.ComponentProps<"div">,
  "title" | "onChange" | "defaultChecked"
> {
  /** Small caption rendered above the banner. Omit when rendering inside a `Field` with its own label. */
  label?: React.ReactNode;
  /** Bold headline inside the banner — doubles as the switch label. */
  title: React.ReactNode;
  /** Supporting copy under the title. */
  description?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Forwarded to the underlying switch, e.g. for uncontrolled form submission. */
  name?: string;
  value?: string;
}

function SwitchBanner({
  className,
  label,
  title,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  value,
  id,
  ...props
}: SwitchBannerProps) {
  const generatedId = React.useId();
  const switchId = id ?? `${generatedId}-switch`;
  const descriptionId = `${switchId}-description`;

  return (
    <div
      data-slot="switch-banner"
      data-disabled={disabled || undefined}
      className={cn("flex w-full flex-col gap-2 data-disabled:opacity-50", className)}
      {...props}
    >
      {label && (
        <Typography
          as="p"
          variant="small"
          data-slot="switch-banner-label"
          className="font-medium text-ink-2"
        >
          {label}
        </Typography>
      )}
      <div className="flex items-start gap-4 rounded-[12px] border border-surface-line bg-surface-stripe p-4">
        <div className="flex flex-1 flex-col gap-1">
          <Label
            htmlFor={switchId}
            data-slot="switch-banner-title"
            className={cn(
              "text-base leading-snug font-semibold text-ink-1",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
          >
            {title}
          </Label>
          {description && (
            <Typography
              as="p"
              variant="xs"
              id={descriptionId}
              data-slot="switch-banner-description"
              className="leading-normal text-ink-3"
            >
              {description}
            </Typography>
          )}
        </div>
        <Switch
          id={switchId}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          className="mt-0.5 shrink-0"
        />
      </div>
    </div>
  );
}

export { SwitchBanner };
export type { SwitchBannerProps };
