import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { Link } from "@/components/ui/Link";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { Group, GroupStatus } from "@/types/Group";

export interface UserGroupEntry {
  id: string;
  groupName: string;
  groupThumbnailUrl?: string | null;
  path: string;
  category: string;
  status: GroupStatus;
  views: number;
}

interface UserGroupsSectionProps {
  groups: Group[];
  loading?: boolean;
}

const STATUS_TYPE = {
  [GroupStatus.STARTED]: "neutral",
  [GroupStatus.ACTIVE]: "success",
  [GroupStatus.SUSPENDED]: "error",
  [GroupStatus.PENDING]: "warning",
  [GroupStatus.IN_PROGRESS]: "info",
  [GroupStatus.PENDING_MODERATION]: "warning",
  [GroupStatus.MANUAL_REVIEW]: "warning",
} as const;

const STATUS_LABEL = {
  [GroupStatus.STARTED]: "Started",
  [GroupStatus.ACTIVE]: "Active",
  [GroupStatus.SUSPENDED]: "Suspended",
  [GroupStatus.PENDING]: "Pending",
  [GroupStatus.IN_PROGRESS]: "In Progress",
  [GroupStatus.PENDING_MODERATION]: "Pending Moderation",
  [GroupStatus.MANUAL_REVIEW]: "Manual Review",
} as const;

const columns: DataTableColumn<UserGroupEntry>[] = [
  {
    id: "group",
    header: "Group",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar
          variant="tile"
          size="md"
          src={row.groupThumbnailUrl ?? undefined}
          name={row.groupName}
        />
        <div className="flex flex-col">
          <Link href={row.path} className="text-sm">
            {row.groupName}
          </Link>
          <Typography variant="tiny" className="mt-1 text-ink-4">
            {row.path}
          </Typography>
        </div>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: (row) => (
      <Typography variant="small" className="text-ink-2">
        {row.category}
      </Typography>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Chip shape="pill" type={STATUS_TYPE[row.status]} label={STATUS_LABEL[row.status]} />
    ),
    skeletonCell: <Skeleton className="h-6 w-20 rounded-full" />,
  },
  {
    id: "members",
    header: "Members",
    headerClassName: "text-right",
    cellClassName: "text-right",
    cell: (row) => (
      <Typography variant="small" className="text-ink-2 tabular-nums">
        {row.views.toLocaleString()}
      </Typography>
    ),
  },
];

export default function UserGroupsSection({ groups, loading }: UserGroupsSectionProps) {
  const entries: UserGroupEntry[] = (Array.isArray(groups) ? groups : []).map((group) => ({
    id: group.uuid,
    groupName: group.name,
    groupThumbnailUrl: group.thumbnailUrl,
    path: group.slug,
    category: group.mainCategory.name,
    status: group.status,
    views: group.memberCount,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Typography variant="tiny" className="font-mono font-medium tracking-[1.6px] text-ink-4">
          GROUPS ADDED
        </Typography>
        <Typography variant="tiny" className="font-mono font-medium tracking-[1.6px] text-ink-4">
          {entries.length} TOTAL
        </Typography>
      </CardHeader>

      {!loading && entries.length === 0 ? (
        <NoData
          title="No groups added yet"
          description="Groups this user adds will show up here."
        />
      ) : (
        <DataTable columns={columns} data={entries} getRowId={(row) => row.id} loading={loading} />
      )}
    </Card>
  );
}
