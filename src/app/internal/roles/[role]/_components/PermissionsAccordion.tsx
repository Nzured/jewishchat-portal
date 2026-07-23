"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Flag, Settings, UserCog, Users } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { Permission } from "@/types/Permission";

type PermissionCategory = "groups" | "users" | "reports" | "other";

const CATEGORY_META: Record<PermissionCategory, { label: string; icon: typeof Flag }> = {
  groups: { label: "Group management", icon: Users },
  users: { label: "User management", icon: UserCog },
  reports: { label: "Report management", icon: Flag },
  other: { label: "Other", icon: Settings },
};

const CATEGORY_ORDER: PermissionCategory[] = ["groups", "users", "reports", "other"];

function getPermissionCategory(name: string): PermissionCategory {
  const lastWord = name.split("_").pop();
  if (lastWord === "groups") return "groups";
  if (lastWord === "users") return "users";
  if (lastWord === "reports") return "reports";
  return "other";
}

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

  const groups = React.useMemo(() => {
    const byCategory = new Map<PermissionCategory, Permission[]>();
    for (const permission of permissions) {
      const category = getPermissionCategory(permission.name);
      const list = byCategory.get(category) ?? [];
      list.push(permission);
      byCategory.set(category, list);
    }
    return CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => ({
      category,
      items: byCategory.get(category)!,
    }));
  }, [permissions]);

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
        {groups.map(({ category, items }) => {
          const { label, icon: Icon } = CATEGORY_META[category];
          const categoryGranted = items.filter((p) => grantedIds.has(p.id)).length;
          const allGranted = categoryGranted === items.length;

          const handleSelectAll = (checked: boolean) => {
            for (const permission of items) onToggle(permission.id, checked);
          };

          return (
            <AccordionPrimitive.Item
              key={category}
              value={category}
              className="overflow-hidden rounded-xl border border-surface-line bg-surface-card"
            >
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger asChild>
                  <div className="group/accordion-trigger flex w-full cursor-pointer items-center justify-between gap-4 bg-surface-bg px-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-brand-green/20">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-surface-line bg-surface-card">
                        <Icon className="size-4 text-ink-3" />
                      </span>
                      <div className="flex items-center gap-2">
                        <Typography variant="small" className="font-semibold text-ink-1">
                          {label}
                        </Typography>
                        <Typography variant="xs" className="text-ink-3">
                          {categoryGranted}/{items.length}
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Typography variant="small" className="text-ink-3">
                        Select all
                      </Typography>
                      <Switch
                        checked={allGranted}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={handleSelectAll}
                      />
                      <ChevronDown className="size-4 shrink-0 text-ink-3 group-aria-expanded/accordion-trigger:hidden" />
                      <ChevronUp className="hidden size-4 shrink-0 text-ink-3 group-aria-expanded/accordion-trigger:inline" />
                    </div>
                  </div>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up">
                <div className="h-(--radix-accordion-content-height) divide-y divide-surface-line border-t border-surface-line">
                  {items.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between gap-4 px-4 py-2.5"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Typography variant="small" className="font-medium text-ink-1">
                          {wordFormatter(permission.name)}
                        </Typography>
                        <Typography variant="xs" className="text-ink-3">
                          {permission.description}
                        </Typography>
                      </div>
                      <Switch
                        checked={grantedIds.has(permission.id)}
                        onCheckedChange={(checked) => onToggle(permission.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          );
        })}
      </AccordionPrimitive.Root>
    </div>
  );
}
