"use client";

import { BarChart3, Info, Table2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Typography } from "@/components/ui/Typography";
import { GrowthSnapshot } from "@/types/Dashboard";
import { formatCount, formatPct } from "./format";

interface LiveGroupsByCategoryProps {
  data?: GrowthSnapshot;
  loading?: boolean;
}

function ThinChip() {
  return (
    <Chip
      label="Thin"
      shape="pill"
      type="warning"
      className="shrink-0 px-2 py-0.5 text-[10px]"
      aria-label="Thin category"
    />
  );
}

export function LiveGroupsByCategory({ data, loading = false }: LiveGroupsByCategoryProps) {
  const rows = [...(data?.liveGroupsByCategory ?? [])].sort(
    (a, b) => (b.liveGroups ?? 0) - (a.liveGroups ?? 0),
  );
  const thinCount = rows.filter((row) => row.thin).length;
  const threshold = data?.thinCategoryThreshold ?? undefined;

  return (
    <Tabs defaultValue="table" className="h-full gap-0">
      <Card className="h-full gap-4 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5">
          <Typography variant="h4" className="text-ink-1">
            Live groups by category
          </Typography>
          <TabsList aria-label="View as">
            <TabsTrigger value="table">
              <Table2 />
              Table
            </TabsTrigger>
            <TabsTrigger value="chart">
              <BarChart3 />
              Chart
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="max-h-80 min-h-0 flex-1 overflow-y-auto px-5">
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <Typography variant="muted">No categories yet.</Typography>
            </div>
          ) : (
            <>
              <TabsContent value="table">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-surface-card">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-8 px-0 font-mono text-[10px] tracking-[0.1em]">
                        Category
                      </TableHead>
                      <TableHead className="h-8 px-2 text-right font-mono text-[10px] tracking-[0.1em]">
                        Live
                      </TableHead>
                      <TableHead className="h-8 pr-0 pl-2 text-right font-mono text-[10px] tracking-[0.1em]">
                        Share
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr:nth-child(even)]:bg-transparent">
                    {rows.map((row) => (
                      <TableRow key={row.categorySlug} className="hover:bg-transparent">
                        <TableCell className="px-0 py-2.5 text-ink-1">
                          <span className="flex flex-wrap items-center gap-2">
                            {row.categoryName}
                            {row.thin && <ThinChip />}
                          </span>
                        </TableCell>
                        <TableCell className="px-2 py-2.5 text-right font-medium text-ink-1">
                          {formatCount(row.liveGroups)}
                        </TableCell>
                        <TableCell className="w-16 py-2.5 pr-0 pl-2 text-right font-mono text-xs text-ink-4">
                          {formatPct(row.sharePct, 1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="chart" className="flex flex-col gap-3">
                {rows.map((row) => (
                  <div key={row.categorySlug} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <Typography variant="small" as="span" className="truncate text-ink-1">
                          {row.categoryName}
                        </Typography>
                        {row.thin && <ThinChip />}
                      </span>
                      <span className="flex shrink-0 items-baseline gap-2">
                        <Typography variant="small" as="span" className="font-medium text-ink-1">
                          {formatCount(row.liveGroups)}
                        </Typography>
                        <Typography
                          variant="xs"
                          as="span"
                          className="w-12 text-right font-mono text-ink-4"
                        >
                          {formatPct(row.sharePct, 1)}
                        </Typography>
                      </span>
                    </div>
                    <Progress
                      value={row.sharePct ?? 0}
                      aria-label={`${row.categoryName} share`}
                      className={row.thin ? "[&>div]:bg-state-warn" : undefined}
                    />
                  </div>
                ))}
              </TabsContent>
            </>
          )}
        </div>

        {!loading && rows.length > 0 && threshold !== undefined && (
          <div className="flex items-center gap-2 border-t border-surface-line px-5 pt-4">
            <Info className="size-3.5 shrink-0 text-ink-4" />
            <Typography variant="xs" as="span" className="text-ink-3">
              {thinCount === 0
                ? `All categories have at least ${threshold} live groups`
                : `${thinCount} ${thinCount === 1 ? "category has" : "categories have"} fewer than ${threshold} live groups`}
            </Typography>
          </div>
        )}
      </Card>
    </Tabs>
  );
}
