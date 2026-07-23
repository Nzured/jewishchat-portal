import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { Category } from "@/types/Category";
import { CategoryIcon } from "./CategoryIcon";

const CANNOT_DELETE_MESSAGE = "Move or remove this category's groups before deleting it.";

interface CategoryCardProps {
  row: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ row, onEdit, onDelete }: CategoryCardProps) {
  const canDelete = row.groupsCount === 0;

  const deleteButton = (
    <Button
      variant="icon"
      size="icon"
      aria-label={`Delete ${row.name}`}
      className="size-11 hover:bg-state-danger/10 hover:text-state-danger md:size-7"
      disabled={!canDelete}
      onClick={() => onDelete(row)}
    >
      <Trash2 className="text-ink-3 transition-colors group-hover/button:text-state-danger" />
    </Button>
  );

  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      onClick={() => onEdit(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(row);
        }
      }}
      className="cursor-pointer transition-shadow hover:shadow-md active:shadow-md"
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {row?.icon && <CategoryIcon icon={row.icon} color={row.color} />}
            <div className="flex flex-col gap-1">
              <Typography variant="small" className="font-semibold text-ink-1">
                {row.name}
              </Typography>
              <Chip
                label={`/${row.slug}`}
                shape="rounded"
                type="neutral"
                className="w-fit font-mono"
              />
            </div>
          </div>

          <div
            className="flex items-center gap-1"
            onClick={(event) => {
              event.stopPropagation();
              if (!canDelete) toast.error(CANNOT_DELETE_MESSAGE);
            }}
          >
            {canDelete ? (
              deleteButton
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>{deleteButton}</span>
                </TooltipTrigger>
                <TooltipContent>{CANNOT_DELETE_MESSAGE}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <Typography variant="muted">{row.description || NOT_APPLICABLE}</Typography>
      </CardContent>
    </Card>
  );
}
