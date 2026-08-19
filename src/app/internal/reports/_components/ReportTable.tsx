"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/app/internal/groups/_components/StatusPill";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { NoData } from "@/components/ui/NoData";
import { Typography } from "@/components/ui/Typography";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, NOT_APPLICABLE } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { formatDate } from "@/lib/date";
import { getGroupPath } from "@/lib/publicPaths";
import { GroupService } from "@/services/group/group.service";
import { AdminGroupReport } from "@/types/Report";
import { ReportCard } from "./ReportCard";

const columns: DataTableColumn<AdminGroupReport>[] = [
  {
    id: "name",
    header: "Group Name",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar variant="tile" src={row.group?.thumbnailUrl ?? undefined} name={row.group?.name} />
        <div className="flex flex-col">
          <Typography variant="small" className="font-semibold text-ink-1">
            {row.group?.name ?? NOT_APPLICABLE}
          </Typography>
          <Typography variant="muted">
            {row.group?.slug ? getGroupPath(row.group) : NOT_APPLICABLE}
          </Typography>
        </div>
      </div>
    ),
  },
  {
    id: "category",
    header: "Reported Category",
    cell: (row) => (
      <Typography variant="small" className="font-medium tabular-nums">
        {wordFormatter(row?.category) ?? NOT_APPLICABLE}
      </Typography>
    ),
  },
  {
    id: "reason",
    header: "Reason",
    cell: (row) => (
      <Typography variant="small" className="font-medium tabular-nums">
        {row?.description ?? NOT_APPLICABLE}
      </Typography>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) =>
      row.group?.status ? (
        <StatusPill status={row.group.status} />
      ) : (
        <Typography variant="muted">{NOT_APPLICABLE}</Typography>
      ),
  },
  {
    id: "lastReported",
    header: "Last Reported",
    cell: (row) => (
      <Typography variant="muted">
        {row.createdAt ? formatDate(row.createdAt) : NOT_APPLICABLE}
      </Typography>
    ),
  },
  {
    id: "actions",
    header: "",
    headerClassName: "text-right",
    cellClassName: "text-right",
    cell: (row) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          asChild
          variant="icon"
          size="icon-sm"
          aria-label={`Edit ${row.group?.name ?? "group"}`}
        >
          <NextLink href={`/internal/reports/${row.id}`}>
            <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green" />
          </NextLink>
        </Button>
      </div>
    ),
  },
];

export function ReportsTable({ onCountChange }: { onCountChange?: (total: number) => void }) {
  const router = useRouter();
  const { hasActiveFilters, clearAllFilters } = useSearchFilter();
  const [reports, setReports] = React.useState<AdminGroupReport[]>([]);
  const [mobileReports, setMobileReports] = React.useState<AdminGroupReport[]>([]);
  const [totalReports, setTotalReports] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(FIRST_PAGE);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);

  React.useEffect(() => {
    let ignore = false;

    async function loadReports() {
      setLoading(true);
      try {
        const res = await GroupService.getAdminGroupReports(false, page - 1, pageSize);
        if (ignore || !res) return;
        setReports(res.data.reports);
        setTotalReports(res.data.totalElements);
        setMobileReports((prev) =>
          page === FIRST_PAGE ? res.data.reports : [...prev, ...res.data.reports],
        );
        onCountChange?.(res.data.totalElements);
      } catch {
        if (ignore) return;
        setReports([]);
        setTotalReports(0);
        if (page === FIRST_PAGE) setMobileReports([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadReports();

    return () => {
      ignore = true;
    };
  }, [page, pageSize, onCountChange]);

  const handleView = React.useCallback(
    (report: AdminGroupReport) => router.push(`/internal/reports/${report.id}`),
    [router],
  );

  return (
    <DataTable
      columns={columns}
      data={reports}
      cardData={mobileReports}
      renderCard={(row) => <ReportCard report={row} onView={handleView} />}
      getRowId={(row) => String(row.id)}
      loading={loading && page === FIRST_PAGE}
      emptyState={
        <NoData
          title={hasActiveFilters ? "No reports match these filters" : "No reports yet"}
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters to see more reports."
              : "Reported groups will show up here."
          }
          onClearFilters={hasActiveFilters ? clearAllFilters : undefined}
        />
      }
      pagination={{
        page,
        pageSize,
        total: totalReports,
        onPageChange: setPage,
        onPageSizeChange: (size) => {
          setPageSize(size);
          setPage(FIRST_PAGE);
        },
      }}
      infiniteScroll={{
        hasMore: mobileReports.length < totalReports,
        onLoadMore: () => setPage((current) => current + 1),
      }}
    />
  );
}
