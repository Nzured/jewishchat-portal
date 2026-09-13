import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { SearchQueryInsight } from "@/types/SearchInsights";
import { formatCount, formatPct } from "../../_components/format";

export function SearchQueryCard({ row }: { row: SearchQueryInsight }) {
  const metrics = [
    { label: "Searches", value: formatCount(row.searches) },
    { label: "Results (avg)", value: formatCount(row.averageResultsReturned) },
    { label: "CTR", value: formatPct(row.ctr) },
  ];

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Typography variant="small" className="font-medium text-ink-1">
            {row.query}
          </Typography>
          {row.averageResultsReturned === 0 && (
            <Chip label="No results" shape="pill" type="warning" />
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
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
