import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DataTableColumn } from "@/components/ui/DataTable";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { Role } from "@/types/Role";

export const columns: DataTableColumn<Role>[] = [
  {
    id: "role",
    header: "Role",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Typography variant="small" className="font-mono font-medium text-ink-2">
          {wordFormatter(row.name)}
        </Typography>
      </div>
    ),
  },
  {
    id: "description",
    header: "Description",
    cell: (row) => (
      <Typography variant="small" className="text-ink-2">
        {row.description ?? NOT_APPLICABLE}
      </Typography>
    ),
  },
  {
    id: "users",
    header: "User Count",
    cell: (row) => (
      <Typography variant="small" className="text-ink-2">
        {row.userCount ?? NOT_APPLICABLE}
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
        <Link href={`/internal/roles/${Number(row.id)}`}>
          <Button variant="icon" size="icon-sm" aria-label={`Edit ${row.name}`}>
            <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green text-ink-4" />
          </Button>
        </Link>
      </div>
    ),
  },
];
