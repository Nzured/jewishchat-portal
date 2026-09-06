import { Eye, MousePointerClick, Pointer, ScanEye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";

interface GroupStatsCardProps {
  group: Group;
  className?: string;
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-surface-line bg-surface-bg p-3">
      <div className="flex min-w-0 items-center gap-1.5 text-brand-green">
        {icon}
        <Typography
          variant="tiny"
          className="min-w-0 truncate font-mono tracking-[1px] text-ink-3 uppercase"
        >
          {label}
        </Typography>
      </div>
      <Typography variant="h4" className="font-semibold tabular-nums text-ink-1">
        {(value ?? 0).toLocaleString()}
      </Typography>
    </div>
  );
}

export function GroupStatsCard({ group, className }: GroupStatsCardProps) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <Typography variant="xs" className="font-mono tracking-[1.5px] text-ink-4 uppercase">
          Engagement
        </Typography>
        <Typography variant="xs" className="font-mono tracking-[1.5px] text-ink-4 uppercase">
          All time
        </Typography>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <StatTile
          icon={<Eye className="size-3.5 shrink-0" />}
          label="Total views"
          value={group.totalViews}
        />
        <StatTile
          icon={<ScanEye className="size-3.5 shrink-0" />}
          label="Unique views"
          value={group.uniqueViews}
        />
        <StatTile
          icon={<MousePointerClick className="size-3.5 shrink-0" />}
          label="Join clicks"
          value={group.totalJoinClicks}
        />
        <StatTile
          icon={<Pointer className="size-3.5 shrink-0" />}
          label="Unique joins"
          value={group.uniqueJoinClicks}
        />
      </CardContent>
    </Card>
  );
}
