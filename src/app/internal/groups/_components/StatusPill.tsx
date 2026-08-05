import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import { GroupStatus } from "@/types/Group";

export const STATUS_STYLES: Record<
  GroupStatus,
  { dot: string; text: string; bg: string; label: string }
> = {
  ACTIVE: {
    dot: "bg-state-success",
    text: "text-state-success",
    bg: "bg-state-bg-success",
    label: "Active",
  },
  PENDING: {
    dot: "bg-state-warn",
    text: "text-state-warn",
    bg: "bg-state-bg-warning",
    label: "Pending",
  },
  SUSPENDED: {
    dot: "bg-state-danger",
    text: "text-state-danger",
    bg: "bg-state-bg-error",
    label: "Suspended",
  },
  PENDING_MODERATION: {
    dot: "bg-state-warn",
    text: "text-state-warn",
    bg: "bg-state-bg-warning",
    label: "Pending Moderation",
  },
  IN_PROGRESS: {
    dot: "bg-state-info",
    text: "text-state-info",
    bg: "bg-state-bg-info",
    label: "In Progress",
  },
  STARTED: {
    dot: "bg-ink-4",
    text: "text-ink-2",
    bg: "bg-surface-stripe",
    label: "Started",
  },
  MANUAL_REVIEW: {
    dot: "bg-state-warn",
    text: "text-state-warn",
    bg: "bg-state-bg-warning",
    label: "Manual Review",
  },
};

export interface StatusPillProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  status: GroupStatus;
}

const statusToChipType: Record<GroupStatus, "neutral" | "error" | "warning" | "success"> = {
  ACTIVE: "success",
  PENDING: "warning",
  SUSPENDED: "error",
  PENDING_MODERATION: "warning",
  IN_PROGRESS: "neutral",
  STARTED: "neutral",
  MANUAL_REVIEW: "warning",
};

const FALLBACK_STYLE = { dot: "bg-ink-4", text: "text-ink-2", bg: "bg-surface-stripe" };

export function StatusPill({ status, className, type: _type, ...props }: StatusPillProps) {
  const style = STATUS_STYLES[status] ?? FALLBACK_STYLE;
  const label = STATUS_STYLES[status]?.label ?? status ?? "Unknown";
  return (
    <Chip
      type={statusToChipType[status] ?? "neutral"}
      shape="pill"
      label={label}
      className={cn(
        "border border-surface-line-strong px-2.5 py-1 text-xs font-medium",
        style.bg,
        style.text,
        className,
      )}
      {...props}
    />
  );
}
