import { ReactNode } from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { formatDataAsOf } from "./format";

interface ReportCardProps {
  title: string;
  subtitle?: ReactNode;
  dataAsOf?: string | null;
  loading?: boolean;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ReportCard({
  title,
  subtitle,
  dataAsOf,
  loading = false,
  actions,
  className,
  children,
}: ReportCardProps) {
  return (
    <Card className={cn("gap-5 py-5", className)}>
      <div className="flex items-start justify-between gap-3 px-5">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography variant="h4" className="text-ink-1">
            {title}
          </Typography>
          {subtitle && <Typography variant="muted">{subtitle}</Typography>}
          <DataAsOf value={dataAsOf} loading={loading} />
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </Card>
  );
}

export function DataAsOf({ value, loading }: { value?: string | null; loading?: boolean }) {
  if (loading) return <Skeleton className="mt-1 h-3 w-40" />;
  if (!value) return null;
  return (
    <Typography
      variant="tiny"
      as="span"
      className="mt-1 inline-flex items-center gap-1 font-mono text-ink-4"
    >
      <Clock className="size-3" aria-hidden />
      Data as of {formatDataAsOf(value)}
    </Typography>
  );
}
