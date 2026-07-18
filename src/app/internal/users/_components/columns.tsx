import { CheckCheck, Minus, Settings } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DataTableColumn } from "@/components/ui/DataTable";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { UserStatus } from "@/types/User";
import { UserRow } from "./UserRow";

const nameColumn: DataTableColumn<UserRow> = {
  id: "name",
  header: "User Name",
  cell: (row) => (
    <div className="flex items-center gap-3">
      <Avatar src={row.profilePic} variant="tile" name={row.name} />
      <div className="flex flex-col">
        <Typography variant="small" className="font-semibold text-ink-1">
          {(row.firstName ?? "") + " " + (row.lastName ?? "")}
        </Typography>
        <Typography variant="muted">{row.email ?? NOT_APPLICABLE}</Typography>
      </div>
    </div>
  ),
};

const joinedDateColumn: DataTableColumn<UserRow> = {
  id: "joinedDate",
  header: "Joined Date",
  cell: (row) => <Typography variant="small">{row.joinedDate ?? NOT_APPLICABLE}</Typography>,
};

const actionsColumn: DataTableColumn<UserRow> = {
  id: "actions",
  header: "",
  headerClassName: "text-right",
  cellClassName: "text-right",
  cell: (row) => (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/internal/users/${row.id}`}>
        <Button variant="icon" size="icon-sm" aria-label={`Manage ${row.firstName}`}>
          <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green text-ink-4" />
        </Button>
      </Link>
    </div>
  ),
};

export const externalColumns: DataTableColumn<UserRow>[] = [
  nameColumn,
  {
    id: "mobileNumber",
    header: "Mobile Number",
    cell: (row) => (
      <div className="flex flex-col items-start gap-1.5">
        <Typography variant="small" className="font-semibold text-ink-1">
          {row.mobile ?? NOT_APPLICABLE}
        </Typography>
        {row.mobile && (
          <Chip
            label={row.mobileNumberVerified ? "Verified" : "Not Verified"}
            shape="pill"
            type={row.mobileNumberVerified ? "success" : "neutral"}
            leftIcon={row.mobileNumberVerified ? <CheckCheck /> : <Minus />}
          />
        )}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => {
      if (row.status)
        return (
          <Chip
            type={row.status === UserStatus.ACTIVE ? "success" : "error"}
            label={row.status}
            shape="pill"
          />
        );
    },
  },
  joinedDateColumn,
  actionsColumn,
];

export const internalColumns: DataTableColumn<UserRow>[] = [
  nameColumn,
  {
    id: "role",
    header: "Role",
    cell: (row) => <Typography variant="small">{row.role ?? NOT_APPLICABLE}</Typography>,
  },
  joinedDateColumn,
  actionsColumn,
];
