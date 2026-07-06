"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { PermissionCategory } from "@/types/Permission";

interface PermissionsAccordionProps {
  categories: PermissionCategory[];
  grantedIds: Set<string>;
  onToggle: (permissionId: string, granted: boolean) => void;
  onToggleCategory: (category: PermissionCategory, granted: boolean) => void;
}

export function PermissionsAccordion({
  categories,
  grantedIds,
  onToggle,
  onToggleCategory,
}: PermissionsAccordionProps) {
  const totalPermissions = categories.reduce((sum, c) => sum + c.permissions.length, 0);
  const totalGranted = categories.reduce(
    (sum, c) => sum + c.permissions.filter((p) => grantedIds.has(p.id)).length,
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Typography variant="xs" className="font-semibold tracking-wide text-ink-3 uppercase">
          Permissions
        </Typography>
        <Typography variant="xs" className="text-ink-3">
          {totalGranted} / {totalPermissions} granted
        </Typography>
      </div>

      <AccordionPrimitive.Root
        type="multiple"
        defaultValue={categories.map((c) => c.id)}
        className="flex flex-col gap-3"
      >
        {categories?.map((category) => {
          const grantedCount = category.permissions.filter((p) => grantedIds.has(p.id)).length;
          const allGranted = grantedCount === category.permissions.length;
          const Icon = category.icon;

          return (
            <AccordionPrimitive.Item
              key={category.id}
              value={category.id}
              className="overflow-hidden rounded-xl border border-surface-line bg-surface-card"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger asChild>
                  <div className="group/accordion-trigger flex w-full cursor-pointer items-center justify-between gap-4 bg-surface-bg px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-brand-green/20">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-surface-line bg-surface-card text-ink-2">
                        <Icon className="size-4" />
                      </span>
                      <Typography variant="small" className="font-semibold text-ink-1">
                        {category.title}
                      </Typography>
                      <Typography variant="xs" className="text-ink-4">
                        {grantedCount}/{category.permissions.length}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-3">
                      <Typography variant="small" className="text-ink-3">
                        Select all
                      </Typography>
                      <Switch
                        checked={allGranted}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={(checked) => onToggleCategory(category, checked)}
                      />
                      <ChevronDown className="size-4 shrink-0 text-ink-3 group-aria-expanded/accordion-trigger:hidden" />
                      <ChevronUp className="hidden size-4 shrink-0 text-ink-3 group-aria-expanded/accordion-trigger:inline" />
                    </div>
                  </div>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up">
                <div className="h-(--radix-accordion-content-height)">
                  {category.permissions.map((permission) => {
                    const granted = grantedIds.has(permission.id);
                    return (
                      <div
                        key={permission.id}
                        className={cn(
                          "flex items-center justify-between gap-4 border-t border-surface-line px-4 py-2.5",
                          granted && "bg-state-bg-success",
                        )}
                      >
                        <Typography
                          variant="small"
                          className={granted ? "font-medium text-ink-1" : "text-ink-3"}
                        >
                          {permission.label}
                        </Typography>
                        <Switch
                          checked={granted}
                          onCheckedChange={(checked) => onToggle(permission.id, checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          );
        })}
      </AccordionPrimitive.Root>
    </div>
  );
}
