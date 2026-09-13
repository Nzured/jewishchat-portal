import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";

export interface MiniStatProps {
  label: string;
  value: string;
  loading?: boolean;
}

export function MiniStat({ label, value, loading }: MiniStatProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-stripe px-4 py-3">
      <Typography
        variant="tiny"
        as="span"
        className="font-mono tracking-[0.08em] text-ink-3 uppercase"
      >
        {label}
      </Typography>
      {loading ? (
        <Skeleton className="h-6 w-14" />
      ) : (
        <Typography variant="large" as="span" className="text-xl leading-none text-ink-1">
          {value}
        </Typography>
      )}
    </div>
  );
}
