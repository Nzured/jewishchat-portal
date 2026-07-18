import { Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DataTableColumn } from "@/components/ui/DataTable";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { Category } from "@/types/Category";
import { CategoryIcon } from "./CategoryIcon";

interface ColumnActions {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function getColumns({ onEdit, onDelete }: ColumnActions): DataTableColumn<Category>[] {
  return [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <CategoryIcon icon={row.icon} color={row.color} />
          <Typography variant="small" className="font-semibold text-ink-1">
            {row.name ?? NOT_APPLICABLE}
          </Typography>
        </div>
      ),
    },
    {
      id: "slug",
      header: "Slug",
      cell: (row) => (
        <Chip label={`/${row.slug}`} shape="rounded" type="neutral" className="font-mono" />
      ),
    },
    {
      id: "description",
      header: "Description",
      cellClassName: "max-w-sm",
      cell: (row) => (
        <Typography variant="small" className="text-ink-2">
          {row.description || NOT_APPLICABLE}
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
            variant="icon"
            size="icon-sm"
            aria-label={`Edit ${row.name}`}
            onClick={() => onEdit(row)}
          >
            <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green text-ink-4" />
          </Button>
          <Button
            variant="icon"
            size="icon-sm"
            aria-label={`Delete ${row.name}`}
            className="hover:bg-state-danger/10 hover:text-state-danger"
            onClick={() => onDelete(row)}
          >
            <Trash2 className="text-ink-3 transition-colors group-hover/button:text-state-danger text-ink-4" />
          </Button>
        </div>
      ),
    },
  ];
}
