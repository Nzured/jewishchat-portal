"use client";

import * as React from "react";
import {
  ArrowRight,
  Copy,
  Eye,
  Menu,
  MousePointerClick,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { GroupSuspensionBanner } from "@/components/ui/GroupSuspensionBanner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Progress } from "@/components/ui/Progress";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_NEW_PATH, NOT_APPLICABLE } from "@/configs/const";
import { useExpiry } from "@/hooks/useExpiry";
import { timeAgo } from "@/lib/date";
import { formatLocation } from "@/lib/location";
import { getGroupEditPath, getGroupPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { GroupService } from "@/services/group/group.service";
import { Group, GroupDraft, GroupDraftStep1Payload, GroupStatus } from "@/types/Group";

const TOTAL_DRAFT_STEPS = 4;

const STATUS_LABELS: Record<GroupStatus, string> = {
  [GroupStatus.STARTED]: "Started",
  [GroupStatus.ACTIVE]: "Live",
  [GroupStatus.SUSPENDED]: "Suspended",
  [GroupStatus.PENDING]: "Pending",
  [GroupStatus.IN_PROGRESS]: "In Progress",
  [GroupStatus.PENDING_MODERATION]: "Pending Moderation",
  [GroupStatus.MANUAL_REVIEW]: "Manual Review",
};

const STATUS_CHIP_TYPE: Record<GroupStatus, "neutral" | "error" | "warning" | "success"> = {
  [GroupStatus.STARTED]: "neutral",
  [GroupStatus.ACTIVE]: "success",
  [GroupStatus.SUSPENDED]: "error",
  [GroupStatus.PENDING]: "warning",
  [GroupStatus.IN_PROGRESS]: "neutral",
  [GroupStatus.PENDING_MODERATION]: "warning",
  [GroupStatus.MANUAL_REVIEW]: "warning",
};

type MyGroupCardItem = { kind: "draft"; draft: GroupDraft } | { kind: "group"; group: Group };

interface MyGroupCardProps {
  item: MyGroupCardItem;
  onEdit?: (group: Group) => void;
  onContinue?: (draft: GroupDraft) => void;
  onResubmit?: (group: Group) => void;
  onDraftDeleted?: (draftId: string) => void;
  onGroupDeleted?: (uuid: string) => void;
  className?: string;
}

function parseStep1(data?: string): GroupDraftStep1Payload | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as GroupDraftStep1Payload;
  } catch {
    return null;
  }
}

function DraftCard({
  draft,
  onContinue,
  onDraftDeleted,
  className,
}: {
  draft: GroupDraft;
  onContinue?: (draft: GroupDraft) => void;
  onDraftDeleted?: (draftId: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const step1 = parseStep1(draft.step1Data);
  const completedSteps = (draft.step1Data ? 1 : 0) + (draft.step2Data ? 1 : 0);
  const currentStep = Math.min(completedSteps + 1, TOTAL_DRAFT_STEPS);
  const expiry = useExpiry(draft);
  const draftName = step1?.name || "Untitled group";
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleContinue = () => {
    if (onContinue) {
      onContinue(draft);
      return;
    }
    router.push(`${EXTERNAL_GROUPS_NEW_PATH}?draftId=${draft.draftId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await GroupService.deleteDraft(draft.draftId);
      onDraftDeleted?.(draft.draftId);
      toast.success("Draft deleted.");
    } catch {
      toast.error("That draft could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-surface-line bg-state-bg-success/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <Avatar variant="tile" name={draftName} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Typography variant="small" className="truncate font-semibold text-ink-1">
          {draftName}
        </Typography>
        <Typography variant="tiny" className="text-ink-3">
          Step {currentStep} of {TOTAL_DRAFT_STEPS} · last edited {timeAgo(draft.lastUpdatedAt)}
          {expiry && (
            <>
              {" · "}
              <span
                title={expiry.exactLabel}
                className={cn(expiry.urgent && "font-medium text-state-danger")}
              >
                {expiry.label}
              </span>
            </>
          )}
        </Typography>
        <Progress value={completedSteps} max={TOTAL_DRAFT_STEPS} className="h-1" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="default"
          color="primary"
          size="sm"
          rightIcon={<ArrowRight />}
          onClick={handleContinue}
        >
          Continue
        </Button>

        <Button
          variant="icon"
          size="icon-lg"
          aria-label={`Delete draft ${draftName}`}
          className="text-ink-4 hover:bg-state-bg-error hover:text-state-danger"
          disabled={isDeleting}
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <DeleteModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete this draft?"
        description={`"${draftName}" and everything filled in so far will be removed. This cannot be undone.`}
        confirmLabel="Delete draft"
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

function GroupItemCard({
  group,
  onEdit,
  onResubmit,
  onGroupDeleted,
  className,
}: {
  group: Group;
  onEdit?: (group: Group) => void;
  onResubmit?: (group: Group) => void;
  onGroupDeleted?: (uuid: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const isSuspended = group.status === GroupStatus.SUSPENDED;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(group);
      return;
    }
    router.push(getGroupEditPath(group));
  };
  const location = formatLocation(group, ["city", "country"]);
  const groupPath = getGroupPath(group);

  const handleCopyLink = async () => {
    setIsMenuOpen(false);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${groupPath}`);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await GroupService.deleteGroup(group.uuid);
      onGroupDeleted?.(group.uuid);
      toast.success("Listing deleted.");
    } catch {
      toast.error("That listing could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(groupPath)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(groupPath);
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-3 rounded-2xl border border-surface-line bg-surface-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar variant="tile" src={group.thumbnailUrl ?? undefined} name={group.name} />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography variant="large" className="truncate font-semibold text-ink-1">
            {group.name ?? NOT_APPLICABLE}
          </Typography>
          <Typography variant="small" className="text-ink-3">
            {group.shortDesc ?? NOT_APPLICABLE}
          </Typography>
          <div className="flex flex-wrap items-center gap-1.5">
            {group.mainCategory?.name && (
              <Chip
                variant="filter"
                shape="pill"
                type="success"
                label={group.mainCategory.name}
                className="text-brand-deep"
              />
            )}
            {group.categories
              ?.filter((category) => category.id !== group.mainCategory?.id)
              .map((category) => (
                <Chip
                  key={category.id}
                  variant="filter"
                  shape="pill"
                  type="neutral"
                  label={category.name}
                />
              ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {location && (
              <Typography variant="tiny" className="text-ink-4">
                {location}
              </Typography>
            )}
            {group.memberCount > 0 && (
              <Typography variant="tiny" className="text-ink-4">
                | {`${group.memberCount.toLocaleString()} members`}
              </Typography>
            )}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-3"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Chip
            variant="filter"
            shape="pill"
            type={STATUS_CHIP_TYPE[group.status]}
            label={STATUS_LABELS[group.status] ?? group.status}
          />

          <div className="flex items-center gap-1.5 text-ink-3">
            <Eye className="size-3.5" />
            <Typography variant="tiny" className="tabular-nums">
              {(group.totalViews ?? 0).toLocaleString()}
            </Typography>
          </div>
          <div className="flex items-center gap-1.5 text-ink-3">
            <MousePointerClick className="size-3.5" />
            <Typography variant="tiny" className="tabular-nums">
              {(group.totalJoinClicks ?? 0).toLocaleString()}
            </Typography>
          </div>

          {isSuspended ? (
            <Button
              variant="default"
              color="primary"
              size="sm"
              leftIcon={<RotateCcw />}
              onClick={() => {
                handleEdit();
                onResubmit?.(group);
              }}
            >
              Edit & Resubmit
            </Button>
          ) : (
            <Button variant="outline" size="sm" leftIcon={<Pencil />} onClick={handleEdit}>
              Edit
            </Button>
          )}

          <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`More actions for ${group.name}`}
                disabled={isDeleting}
              >
                <Menu className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 gap-1 p-2">
              <Button
                variant="icon"
                size="sm"
                className="w-full justify-start gap-2 px-2"
                onClick={() => void handleCopyLink()}
              >
                <Copy className="size-4" />
                Copy link
              </Button>
              <Button
                variant="icon"
                size="sm"
                className="w-full justify-start gap-2 px-2 text-state-danger hover:bg-state-bg-error hover:text-state-danger [&_svg]:text-state-danger"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 className="size-4" />
                Delete listing
              </Button>
            </PopoverContent>
          </Popover>

          <DeleteModal
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title="Delete this listing?"
            description={`"${group.name}" will be removed from the directory permanently. This cannot be undone.`}
            confirmLabel="Delete listing"
            onConfirm={() => void handleDelete()}
          />
        </div>
      </div>

      <GroupSuspensionBanner group={group} title="Hidden from the directory" showResubmitHint />
    </div>
  );
}

export default function MyGroupCard({
  item,
  onEdit,
  onContinue,
  onResubmit,
  onDraftDeleted,
  onGroupDeleted,
  className,
}: MyGroupCardProps) {
  if (item.kind === "draft") {
    return (
      <DraftCard
        draft={item.draft}
        onContinue={onContinue}
        onDraftDeleted={onDraftDeleted}
        className={className}
      />
    );
  }

  return (
    <GroupItemCard
      group={item.group}
      onEdit={onEdit}
      onResubmit={onResubmit}
      onGroupDeleted={onGroupDeleted}
      className={className}
    />
  );
}
