import { Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Link } from "@/components/ui/Link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { Typography } from "@/components/ui/Typography";
import { Category } from "@/types/Category";
import { CategoryIcon } from "./CategoryIcon";

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
      size="icon-sm"
      aria-label={`Delete ${row.name}`}
      className="hover:bg-state-danger/10 hover:text-state-danger"
      disabled={!canDelete}
      onClick={() => onDelete(row)}
    >
      <Trash2 className="text-ink-3 transition-colors group-hover/button:text-state-danger" />
    </Button>
  );

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <CategoryIcon icon={row.icon} color={row.color} />
            <div className="flex flex-col gap-1">
              <Typography variant="small" className="font-semibold text-ink-1">
                {row.name}
              </Typography>
              <Chip label={`/${row.slug}`} shape="rounded" type="neutral" className="font-mono" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="icon"
              size="icon-sm"
              aria-label={`Edit ${row.name}`}
              onClick={() => onEdit(row)}
            >
              <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green" />
            </Button>
            {canDelete ? (
              deleteButton
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>{deleteButton}</span>
                </TooltipTrigger>
                <TooltipContent>
                  Move or remove this category&apos;s groups before deleting it.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <Typography variant="muted">{row.description}</Typography>

        <div className="border-t border-surface-line pt-3">
          <Link href={`/external/groups?category=${row.slug}`}>{row.groupsCount} groups</Link>
        </div>
      </CardContent>
    </Card>
  );
}
