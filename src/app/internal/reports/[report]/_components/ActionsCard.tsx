"use client";

import * as React from "react";
import { CheckCheck, History, PauseCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { ModerationActionItem, ModerationActionsCard } from "@/components/ui/ModerationActionsCard";
import { SuspendGroupModal } from "@/components/ui/SuspendGroupModal";
import { Typography } from "@/components/ui/Typography";
import { GroupService } from "@/services/group/group.service";
import { Group, GroupStatus } from "@/types/Group";

interface ActionsCardProps {
  /** The report-detail flow only has a thin group slice (uuid/slug/name/status), not the full `Group`. */
  group: Partial<Group> & Pick<Group, "name" | "status" | "uuid">;
  onSuspend?: (data: { reason: string; reasonLabel: string; remark: string }) => void;
  onRelist?: () => void;
  onDelete?: () => void;
  onResolveAll?: () => void;
}

export default function ActionsCard({
  group,
  onSuspend,
  onRelist,
  onDelete,
  onResolveAll,
}: ActionsCardProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isResettingCount, setIsResettingCount] = React.useState(false);
  const [isResolvingAll, setIsResolvingAll] = React.useState(false);

  const handleResetReportCount = async () => {
    if (!group?.uuid) return;
    setIsResettingCount(true);
    try {
      await GroupService.resetReportCount(group.uuid);
    } catch {
      // The axios error interceptor already surfaces a toast for this.
    } finally {
      setIsResettingCount(false);
    }
  };

  const handleResolveAll = async () => {
    if (!group?.uuid) return;
    setIsResolvingAll(true);
    try {
      await GroupService.resolveAllReports(group.uuid);
      onResolveAll?.();
    } catch {
      // The axios error interceptor already surfaces a toast for this.
    } finally {
      setIsResolvingAll(false);
    }
  };

  const handleDelete = async () => {
    if (!group?.uuid) return;
    try {
      await GroupService.rejectGroup(group.uuid, "Permanently deleted by admin");
      onDelete?.();
    } catch {
      // The axios error interceptor already surfaces a toast for this.
    }
  };

  const actions: ModerationActionItem[] = [
    group.status === GroupStatus.SUSPENDED
      ? {
          key: "relist",
          primary: true,
          node: (
            <Button
              size="sm"
              leftIcon={<RefreshCw className="size-4" />}
              variant="default"
              color="primary"
              onClick={onRelist}
            >
              Re-list Group
            </Button>
          ),
        }
      : {
          key: "suspend",
          primary: true,
          node: (
            <SuspendGroupModal
              group={group}
              onSuspend={onSuspend}
              trigger={
                <Button
                  size="sm"
                  leftIcon={<PauseCircle className="size-4" />}
                  variant="default"
                  color="warning"
                >
                  Suspend Group
                </Button>
              }
            />
          ),
        },
    {
      key: "mark-reviewed",
      node: (
        <Button
          size="sm"
          leftIcon={<CheckCheck className="size-4" />}
          variant="secondary"
          color="primary"
          disabled={isResolvingAll}
          onClick={() => void handleResolveAll()}
        >
          Mark as reviewed
        </Button>
      ),
    },
    {
      key: "reset-report-count",
      node: (
        <Button
          size="sm"
          leftIcon={<History className="size-4" />}
          variant="secondary"
          color="warning"
          disabled={isResettingCount}
          onClick={() => void handleResetReportCount()}
        >
          Reset Report Count
        </Button>
      ),
    },
    {
      key: "delete",
      node: (
        <DeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button
              size="sm"
              leftIcon={<Trash2 className="size-4" />}
              variant="secondary"
              color="danger"
            >
              Permenantly Delete
            </Button>
          }
          title="Permanently delete this group?"
          description={
            <>
              <Typography as="span" variant="small" className="font-semibold text-ink-2">
                This cannot be undone.
              </Typography>{" "}
              It removes{" "}
              <Typography as="span" variant="small" className="font-semibold text-ink-2">
                {group.name}
              </Typography>{" "}
              along with all of its reports, metrics and submission history. This is a
              high-privilege action.
            </>
          }
          onConfirm={() => void handleDelete()}
        />
      ),
    },
  ];

  return <ModerationActionsCard actions={actions} contentClassName="pt-2" />;
}
