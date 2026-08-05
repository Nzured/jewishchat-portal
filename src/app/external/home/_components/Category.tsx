"use client";

import { Icon } from "@/components/ui/Icon";
import { Typography } from "@/components/ui/Typography";
import { categoryColorClasses } from "@/lib/categoryColor";
import { cn } from "@/lib/utils";
import { CategoryColor } from "@/types/Category";

export const Category = ({
  number,
  icon,
  name,
  count,
  color,
}: {
  number: string;
  icon?: string;
  name: string;
  count: number;
  color?: CategoryColor;
}) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <Typography variant="xs" className="text-ink-4">
          {number}
        </Typography>

        {icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              categoryColorClasses(color, icon),
            )}
          >
            <Icon name={icon} className="size-4" />
          </span>
        )}

        {name && (
          <Typography variant="large" className="font-semibold text-ink-1">
            {name}
          </Typography>
        )}
      </div>
      {count > 0 && (
        <Typography variant="xs" className="shrink-0 font-mono text-ink-3">
          {count} groups
        </Typography>
      )}
    </div>
  );
};
