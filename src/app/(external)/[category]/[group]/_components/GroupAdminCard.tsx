import { CircleUserRound } from "lucide-react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_PROFILE_PATH } from "@/configs/const";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Group } from "@/types/Group";

interface GroupAdminCardProps {
  group: Group;
  className?: string;
}

export function GroupAdminCard({ group, className }: GroupAdminCardProps) {
  const owner = group.owner;
  const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.trim() : "";
  const ownerUuid = owner?.uuid ?? group.submittedByUuid;
  const ownerProfilePath = ownerUuid ? `${EXTERNAL_PROFILE_PATH}/${ownerUuid}` : null;

  if (!ownerName) return null;

  return (
    <Card className={cn("gap-3", className)}>
      <Typography
        variant="xs"
        className="px-(--card-spacing) font-mono tracking-[1.5px] text-ink-4 uppercase"
      >
        Listed by
      </Typography>

      <div className="flex items-center gap-3 px-(--card-spacing)">
        <Avatar
          variant="circle"
          size="lg"
          name={ownerName}
          className="bg-brand-soft text-brand-deep"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography variant="small" className="truncate font-semibold text-ink-1">
            {ownerName}
          </Typography>
          {owner?.joinedOn && (
            <Typography variant="xs" className="text-ink-3">
              Member since {formatDate(owner.joinedOn, "MMM YYYY")}
            </Typography>
          )}
        </div>
      </div>

      {ownerProfilePath && (
        <div className="px-(--card-spacing)">
          <Button
            variant="secondary"
            color="primary"
            size="sm"
            rightIcon={<CircleUserRound />}
            className="w-full"
            asChild
          >
            <NextLink href={ownerProfilePath}>View profile</NextLink>
          </Button>
        </div>
      )}
    </Card>
  );
}
