"use client";

import * as React from "react";
import { CheckCheck, History, PauseCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { ModerationActionItem, ModerationActionsCard } from "@/components/ui/ModerationActionsCard";
import { Typography } from "@/components/ui/Typography";
import { Group, GroupStatus } from "@/types/Group";
import { SuspendGroupModal } from "./SuspendGroupModal";

interface ActionsCardProps {
  group: Group;
  onSuspend?: (data: { reason: string; reasonLabel: string; remark: string }) => void;
  onRelist?: () => void;
  onDelete?: () => void;
}

export default function ActionsCard({ group, onSuspend, onRelist, onDelete }: ActionsCardProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

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
          onConfirm={() => onDelete?.()}
        />
      ),
    },
  ];

  return <ModerationActionsCard actions={actions} contentClassName="pt-2" />;
}
