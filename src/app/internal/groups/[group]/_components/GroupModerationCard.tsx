"use client";

import * as React from "react";
import { Check, PauseCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { ModerationActionItem, ModerationActionsCard } from "@/components/ui/ModerationActionsCard";
import { SuspendGroupModal } from "@/components/ui/SuspendGroupModal";
import { Textarea } from "@/components/ui/Textarea";
import { Group, GroupStatus } from "@/types/Group";
import { useAdminGroupContext } from "../../_context/AdminGroupContext";

interface GroupModerationCardProps {
  group: Group | null;
  loading?: boolean;
  onGroupChange?: (group: Group) => void;
  onSuspended?: (data: { reasonLabel: string; remark: string }) => void;
  onRelisted?: () => void;
}

export default function GroupModerationCard({
  group,
  loading,
  onGroupChange,
  onSuspended,
  onRelisted,
}: GroupModerationCardProps) {
  const { reactivateGroup, approveGroup, rejectGroup } = useAdminGroupContext();
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");

  const isSuspended = group?.status === GroupStatus.SUSPENDED;
  const isManualReview = group?.status === GroupStatus.MANUAL_REVIEW;

  const handleSuspend = (data: { reasonLabel: string; remark: string; group?: Group }) => {
    if (data.group) onGroupChange?.(data.group);
    onSuspended?.({ reasonLabel: data.reasonLabel, remark: data.remark });
  };

  const handleReactivate = async () => {
    if (!group?.uuid) return;
    try {
      const updated = await reactivateGroup(group.uuid);
      if (updated) onGroupChange?.(updated);
      onRelisted?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async () => {
    if (!group?.uuid) return;
    try {
      const updated = await approveGroup(group.uuid);
      if (updated) onGroupChange?.(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async () => {
    if (!group?.uuid) return;
    try {
      const updated = await rejectGroup(group.uuid, rejectionReason.trim());
      if (updated) onGroupChange?.(updated);
      setRejectionReason("");
    } catch (error) {
      console.error(error);
    }
  };

  const actions: ModerationActionItem[] = [
    ...(isManualReview
      ? [
          {
            key: "approve",
            primary: true,
            node: (
              <Button
                size="sm"
                leftIcon={<Check className="size-4" />}
                variant="default"
                color="primary"
                onClick={() => void handleApprove()}
              >
                Approve Group
              </Button>
            ),
          },
          {
            key: "reject",
            node: (
              <Button
                size="sm"
                leftIcon={<X className="size-4" />}
                variant="secondary"
                color="danger"
                onClick={() => setRejectModalOpen(true)}
              >
                Reject Group
              </Button>
            ),
          },
        ]
      : []),
    ...(group
      ? [
          isSuspended
            ? {
                key: "reactivate",
                primary: true,
                node: (
                  <Button
                    size="sm"
                    leftIcon={<RefreshCw className="size-4" />}
                    variant="default"
                    color="primary"
                    onClick={() => void handleReactivate()}
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
                    onSuspend={handleSuspend}
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
        ]
      : []),
  ];

  return (
    <>
      <ModerationActionsCard title="MODERATION" actions={actions} loading={loading || !group} />

      <Modal
        open={rejectModalOpen}
        onOpenChange={(open) => {
          setRejectModalOpen(open);
          if (!open) setRejectionReason("");
        }}
      >
        <ModalContent variant="danger">
          <ModalHeader icon={<X />}>
            <ModalTitle>Reject this group?</ModalTitle>
            <ModalDescription>
              <span className="font-semibold text-ink-2">{group?.name}</span> will not be listed in
              the public directory. Let the submitter know why.
            </ModalDescription>
          </ModalHeader>

          <Textarea
            placeholder="Reason for rejection"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />

          <ModalFooter>
            <ModalClose asChild>
              <Button
                size="sm"
                leftIcon={<X />}
                variant="secondary"
                color="primary"
                className="text-ink-2 hover:bg-surface-bg"
              >
                Cancel
              </Button>
            </ModalClose>
            <Button
              size="sm"
              leftIcon={<X />}
              variant="default"
              color="danger"
              disabled={!rejectionReason.trim()}
              onClick={() => {
                setRejectModalOpen(false);
                void handleReject();
              }}
            >
              Reject Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
