import * as React from "react";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

interface HeaderProps {
  tags?: string[];
  title: React.ReactNode;
  titleAs?: React.ElementType;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function Header({ tags = [], title, titleAs, description, action, className }: HeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {tags?.length > 0 && (
          <div className="flex items-center gap-2">
            {tags.map((tag) => (
              <Typography
                key={tag}
                variant="xs"
                className="font-mono font-medium tracking-[1.5px] text-brand-green uppercase"
              >
                {tag}
              </Typography>
            ))}
          </div>
        )}
        <Typography
          as={titleAs}
          variant="h2"
          className="font-display text-2xl font-bold tracking-tight text-ink-1 sm:text-3xl"
        >
          {title}
        </Typography>
        {description && (
          <Typography variant="small" className="text-ink-3">
            {description}
          </Typography>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
