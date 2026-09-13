import { ReactNode } from "react";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}

export function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <Typography variant="h4" className="text-ink-1">
          {title}
        </Typography>
        {subtitle && <Typography variant="muted">{subtitle}</Typography>}
      </div>
      {badge}
    </div>
  );
}

interface SectionBadgeProps {
  children: ReactNode;
  tone?: "success" | "neutral";
  className?: string;
}

export function SectionBadge({ children, tone = "neutral", className }: SectionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-medium tracking-[0.1em] uppercase",
        tone === "success"
          ? "border-state-success/20 bg-state-bg-success text-state-success"
          : "border-surface-line-strong bg-surface-card text-ink-3",
        className,
      )}
    >
      {children}
    </span>
  );
}
