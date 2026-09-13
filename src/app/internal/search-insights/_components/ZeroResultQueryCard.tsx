import { Card, CardContent } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { ZeroResultQuery } from "@/types/SearchInsights";
import { formatCount, formatTimeAgo } from "../../_components/format";

export function ZeroResultQueryCard({ row }: { row: ZeroResultQuery }) {
  const metrics = [
    { label: "Searches", value: formatCount(row.searches) },
    { label: "Last searched", value: formatTimeAgo(row.lastSearchedAt) },
  ];

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <Typography variant="small" className="font-medium text-ink-1">
          {row.query}
        </Typography>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-1">
              <Typography
                variant="tiny"
                as="span"
                className="font-mono tracking-[0.08em] text-ink-3 uppercase"
              >
                {metric.label}
              </Typography>
              <Typography variant="small" as="span" className="font-mono text-ink-1">
                {metric.value}
              </Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
