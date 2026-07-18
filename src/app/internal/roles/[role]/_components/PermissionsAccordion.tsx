"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { Permission } from "@/types/Permission";

interface PermissionsAccordionProps {
  permissions: Permission[];
  grantedIds: Set<number>;
  onToggle: (permissionId: number, granted: boolean) => void;
}

export function PermissionsAccordion({
  permissions,
  grantedIds,
  onToggle,
}: PermissionsAccordionProps) {
  const totalGranted = permissions.filter((p) => grantedIds.has(p.id)).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Typography variant="xs" className="font-semibold tracking-wide text-ink-3 uppercase">
          Permissions
        </Typography>
        <Typography variant="xs" className="text-ink-3">
          {totalGranted} / {permissions.length} granted
        </Typography>
      </div>

      <AccordionPrimitive.Root type="multiple" className="flex flex-col gap-3">
        {permissions?.map((permission) => {
          const granted = grantedIds.has(permission.id);

          return (
            <AccordionPrimitive.Item
              key={permission.id}
              value={String(permission.id)}
              className="overflow-hidden rounded-xl border border-surface-line bg-surface-card"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger asChild>
                  <div className="group/accordion-trigger flex w-full cursor-pointer items-center justify-between gap-4 bg-surface-bg px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-brand-green/20">
                    <Typography variant="small" className="font-semibold text-ink-1">
                      {permission.name}
                    </Typography>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={granted}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={(checked) => onToggle(permission.id, checked)}
                      />
                      <ChevronDown className="size-4 shrink-0 text-ink-3 group-aria-expanded/accordion-trigger:hidden" />
                      <ChevronUp className="hidden size-4 shrink-0 text-ink-3 group-aria-expanded/accordion-trigger:inline" />
                    </div>
                  </div>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up">
                <div className="h-(--radix-accordion-content-height) border-t border-surface-line px-4 py-2.5">
                  <Typography variant="small" className="text-ink-3">
                    {permission.description}
                  </Typography>
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          );
        })}
      </AccordionPrimitive.Root>
    </div>
  );
}
