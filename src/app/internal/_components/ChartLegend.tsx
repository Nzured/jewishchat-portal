import { Typography } from "@/components/ui/Typography";

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
}

export function ChartLegend({ items }: { items: readonly ChartLegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {items.map((item) => (
        <span key={item.key} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <Typography variant="xs" as="span" className="text-ink-2">
            {item.label}
          </Typography>
        </span>
      ))}
    </div>
  );
}
