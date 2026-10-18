import { CSSProperties, ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Link } from "@/components/ui/Link";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { AnimatedValue } from "./AnimatedValue";

export type StatTone = "success" | "warning" | "danger" | "info";

const toneStyles: Record<StatTone, { icon: string; hint: string }> = {
  success: { icon: "bg-state-bg-success text-state-success", hint: "text-state-success" },
  warning: { icon: "bg-state-bg-warning text-state-warn", hint: "text-state-warn" },
  danger: { icon: "bg-state-bg-error text-state-danger", hint: "text-state-danger" },
  info: { icon: "bg-state-bg-info text-state-info", hint: "text-state-info" },
};

export interface StatTileProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: StatTone;
  hint?: ReactNode;
  hintTone?: StatTone | "muted";
  action?: { label: string; href: string };
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function StatTile({
  label,
  value,
  icon,
  tone = "info",
  hint,
  hintTone,
  action,
  loading = false,
  className,
  style,
}: StatTileProps) {
  const resolvedHintTone = hintTone ?? tone;
  const hintClass = resolvedHintTone === "muted" ? "text-ink-3" : toneStyles[resolvedHintTone].hint;

  return (
    <Card
      style={style}
      className={cn(
        "group/tile gap-0 py-5 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md",
        "animate-in fade-in zoom-in-95 animation-duration-500 fill-mode-both motion-reduce:animate-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover/tile:scale-110 motion-reduce:transition-none [&_svg]:size-4",
            toneStyles[tone].icon,
          )}
        >
          {icon}
        </span>
        <Typography
          variant="tiny"
          as="span"
          className="font-mono font-medium tracking-[0.08em] text-ink-3 uppercase"
        >
          {label}
        </Typography>
      </div>

      <Typography
        variant="h2"
        as="div"
        className="mt-4 px-5 text-[32px] leading-none font-semibold tracking-tight text-ink-1"
      >
        {loading ? <Skeleton className="h-8 w-16" /> : <AnimatedValue value={value} />}
      </Typography>

      {(hint || action) && (
        <div className="mt-6 flex items-center justify-between gap-3 px-5">
          {loading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <Typography variant="small" as="span" className={cn("truncate text-[13px]", hintClass)}>
              {hint}
            </Typography>
          )}
          {action && (
            <Link href={action.href} arrow className="shrink-0 text-ink-1">
              {action.label}
            </Link>
          )}
        </div>
      )}
    </Card>
  );
}
