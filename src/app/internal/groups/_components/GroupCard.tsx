import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_PATH, NOT_APPLICABLE } from "@/configs/const";
import { formatDate } from "@/lib/date";
import { Group } from "@/types/Group";
import { StatusPill } from "./StatusPill";

function countExtraCategories(group: Group) {
  return group.categories?.filter((category) => category.id !== group.mainCategory?.id).length ?? 0;
}

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
}

export function GroupCard({ group, onEdit }: GroupCardProps) {
  const category = group.mainCategory?.name ?? NOT_APPLICABLE;
  const overflow = countExtraCategories(group);

  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      onClick={() => onEdit(group)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(group);
        }
      }}
      className="cursor-pointer transition-shadow hover:shadow-md active:shadow-md"
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar variant="tile" src={group.thumbnailUrl ?? undefined} name={group.name} />
            <div className="flex flex-col">
              <Typography variant="small" className="font-semibold text-ink-1">
                {group.name}
              </Typography>
              <Typography variant="muted">{`${EXTERNAL_GROUPS_PATH}/${group.slug}`}</Typography>
            </div>
          </div>
          <StatusPill status={group.status} />
        </div>

        <div className="flex items-center gap-1.5">
          <Chip label={category} shape="pill" title={category} className="min-w-0 shrink" />
          {overflow > 0 && (
            <Typography variant="muted" className="shrink-0 whitespace-nowrap">
              +{overflow}
            </Typography>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Typography variant="muted">
            <span className="font-medium tabular-nums text-ink-1">
              {group.memberCount.toLocaleString()}
            </span>{" "}
            members
          </Typography>
          <Typography variant="muted">
            Added {group.createdOn ? formatDate(group.createdOn) : NOT_APPLICABLE}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
