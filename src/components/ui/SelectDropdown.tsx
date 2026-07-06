"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface SelectDropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
}

type SelectTriggerOwnProps = Omit<
  React.ComponentProps<typeof SelectTrigger>,
  "value" | "defaultValue" | "children" | "dir" | "name" | "disabled" | "form" | "autoComplete"
>;

interface SelectDropdownProps
  extends Omit<React.ComponentProps<typeof Select>, "children">, SelectTriggerOwnProps {
  items: SelectDropdownItem[];
  placeholder?: string;
}

function SelectDropdown({
  items,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  dir,
  name,
  autoComplete,
  disabled,
  required,
  form,
  placeholder = "Select...",
  className,
  size = "default",
  ...triggerProps
}: SelectDropdownProps) {
  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      dir={dir}
      name={name}
      autoComplete={autoComplete}
      disabled={disabled}
      required={required}
      form={form}
    >
      <SelectTrigger size={size} className={cn("w-full", className)} {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { SelectDropdown };
export type { SelectDropdownItem, SelectDropdownProps };
