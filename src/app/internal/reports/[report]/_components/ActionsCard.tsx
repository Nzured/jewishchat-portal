"use client";

import * as React from "react";
import { CheckCheck, History, PauseCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { DeleteModal } from "@/components/ui/DeleteModal";
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

  return (
    <Card className="flex flex-col gap-2">
      <CardHeader>
        <Typography variant={"tiny"} className="text-ink-3 font-mono font-medium tracking-[1.6px]">
          MODERATIONS
        </Typography>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pt-2">
        {group.status === GroupStatus.SUSPENDED ? (
          <Button
            size={"sm"}
            leftIcon={<RefreshCw />}
            variant={"default"}
            color="primary"
            onClick={onRelist}
          >
            Re-list Group
          </Button>
        ) : (
          <SuspendGroupModal
            group={group}
            onSuspend={onSuspend}
            trigger={
              <Button size={"sm"} leftIcon={<PauseCircle />} variant={"default"} color="warning">
                Suspend Group
              </Button>
            }
          />
        )}
        <Button size={"sm"} leftIcon={<CheckCheck />} variant={"secondary"} color="primary">
          Mark as reviewed
        </Button>
        <Button size={"sm"} leftIcon={<History />} variant={"secondary"} color="warning">
          Reset Report Count
        </Button>
        <DeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button size={"sm"} leftIcon={<Trash2 />} variant={"secondary"} color="danger">
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
                {group.groupName}
              </Typography>{" "}
              along with all of its reports, metrics and submission history. This is a
              high-privilege action.
            </>
          }
          onConfirm={() => onDelete?.()}
        />
      </CardContent>
    </Card>
  );
}
