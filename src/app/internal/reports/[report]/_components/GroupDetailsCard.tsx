import { Quote } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { LinkDisplay } from "@/components/ui/LinkDisplay";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { cn } from "@/lib/utils";
import { Group, GroupStatus } from "@/types/Group";

interface GroupDetailsCardProps {
  group?: Group;
}

const STATUS_CHIP_TYPE = {
  [GroupStatus.STARTED]: "neutral",
  [GroupStatus.ACTIVE]: "success",
  [GroupStatus.SUSPENDED]: "error",
  [GroupStatus.PENDING]: "warning",
  [GroupStatus.IN_PROGRESS]: "info",
  [GroupStatus.PENDING_MODERATION]: "warning",
  [GroupStatus.MANUAL_REVIEW]: "warning",
} as const;

export default function GroupDetailsCard({ group }: GroupDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        {/* TODO: Group has no image field yet; Avatar falls back to initials from name. */}
        <Avatar variant={"tile"} size="lg" name={group?.name} />
        <div className="flex flex-col items-start gap-1">
          <Typography variant={"large"} className="text-ink-1 font-semibold">
            {group?.name ?? NOT_APPLICABLE}
          </Typography>
          <Chip
            shape="pill"
            type={group?.status ? STATUS_CHIP_TYPE[group.status] : "neutral"}
            label={wordFormatter(group?.status)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col">
        {group?.slug && (
          <div className="flex flex-col gap-3">
            <div></div>
            <div>
              <LinkDisplay url={`jewishchat.com${group.slug}`} />
            </div>
          </div>
        )}
        <Typography
          variant={"xs"}
          className="text-ink-4 font-medium my-3 mt-6 font-mono tracking-[1.5px]"
        >
          CATEGORIES
        </Typography>
        <div className="flex flex-row gap-2">
          {group?.mainCategory && (
            <Chip shape="rounded" label={wordFormatter(group.mainCategory.name)} type="info" />
          )}
          {group?.categories?.map((category) => {
            return (
              <Chip key={category.slug} shape="rounded" label={wordFormatter(category.name)} />
            );
          })}
        </div>
        <div className="flex flex-row justify-between my-2 mt-6">
          <Typography variant={"xs"} className="text-ink-3 font-regular">
            Members
          </Typography>
          <Typography variant={"xs"} className="text-ink-2 font-medium">
            {group?.memberCount ?? NOT_APPLICABLE}
          </Typography>
        </div>
        <Separator />
        <div className="flex flex-row justify-between my-3">
          <Typography variant={"xs"} className="text-ink-3 font-regular">
            Created Date
          </Typography>
          <Typography variant={"xs"} className="text-ink-2 font-medium">
            {group?.createdOn ?? NOT_APPLICABLE}
          </Typography>
        </div>
        <Separator />
        <Typography
          variant={"xs"}
          className="text-ink-4 font-medium my-3 mt-6 font-mono tracking-[1.5px]"
        >
          OWNER
        </Typography>
        {/* TODO: Group has no owner field yet; wire up once owner lookup (e.g. by submittedByUuid) is available. */}
        <Typography variant={"xs"} className="text-ink-3 font-regular">
          {NOT_APPLICABLE}
        </Typography>
        <Typography
          variant={"xs"}
          className="text-ink-4 font-medium my-3 mt-6 font-mono tracking-[1.5px]"
        >
          MESSAGE BY OWNER
        </Typography>
        <div
          className={cn(
            "flex flex-row items-center  gap-4 rounded-xl border border-surface-line bg-surface-bg p-3 px-4",
          )}
        >
          <Quote size={18} className="mt-0.5 shrink-0 text-ink-4" />

          <div className="flex flex-col items-start gap-1">
            <Typography variant={"xs"} className="text-ink-2">
              Resolved the issue and resubmitted
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
