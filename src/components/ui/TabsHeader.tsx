"use client";

import * as React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

export interface TabHeaderItem {
  value: string;
  label: string;
  disabled?: boolean;
  /** Pills variant only. */
  icon?: React.ReactNode;
  /** Pills variant only. */
  count?: number;
}

interface TabsHeaderProps {
  items: TabHeaderItem[];
  variant?: "steps" | "pills";
  className?: string;
}

function StepsTabsHeader({ items, className }: { items: TabHeaderItem[]; className?: string }) {
  return (
    <TabsList
      className={cn(
        "mb-3 flex h-auto w-full items-center justify-start gap-2 rounded-none bg-transparent p-0 text-xs font-semibold tracking-wider",
        className,
      )}
    >
      {items.map((item, index) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="group flex items-center justify-start gap-2 rounded-none border-b-[3px] data-[state=inactive]:border-b-surface-line bg-transparent p-0 pb-2.5 shadow-none data-[state=active]:border-b-brand-green data-[state=active]:bg-transparent data-[state=active]:text-brand-green data-[state=inactive]:text-ink-4 data-[state=active]:shadow-none disabled:opacity-100"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] group-data-[state=active]:border-brand-green group-data-[state=active]:bg-brand-green group-data-[state=inactive]:border-ink-4 group-data-[state=inactive]:bg-transparent">
            <Typography
              variant="p"
              className="group-data-[state=active]:text-white group-data-[state=inactive]:text-ink-4"
            >
              {index + 1}
            </Typography>
          </div>
          <Typography
            variant="p"
            className="uppercase group-data-[state=active]:font-semibold group-data-[state=inactive]:font-normal group-data-[state=active]:text-ink-1 group-data-[state=inactive]:text-ink-4"
          >
            {item.label}
          </Typography>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

function PillsTabsHeader({ items, className }: { items: TabHeaderItem[]; className?: string }) {
  return (
    <TabsList
      className={cn(" w-fit  gap-1 rounded-lg bg-surface-card p-2 py-6 shadow-sm", className)}
    >
      {items.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="group h-8 gap-1.5  rounded-lg px-3 text-sm font-medium text-ink-3 data-active:bg-brand-softer data-active:text-state-success data-active:shadow-sm"
        >
          {item.icon}
          {item.label}
          {item.count !== undefined && (
            <span className="rounded-full bg-surface-line px-1.5 py-0.5 text-xs font-semibold text-ink-3 group-data-active:bg-brand-soft group-data-active:text-brand-green">
              {item.count}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

export function TabsHeader({ items, variant = "steps", className }: TabsHeaderProps) {
  if (variant === "pills") {
    return <PillsTabsHeader items={items} className={className} />;
  }

  return <StepsTabsHeader items={items} className={className} />;
}
