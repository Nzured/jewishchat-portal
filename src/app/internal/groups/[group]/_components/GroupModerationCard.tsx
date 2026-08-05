"use client";

import * as React from "react";
import { PauseCircle, RefreshCw, X } from "lucide-react";
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
import { Group, GroupStatus } from "@/types/Group";
import { useAdminGroupContext } from "../../_context/AdminGroupContext";

interface GroupModerationCardProps {
  group: Group | null;
  loading?: boolean;
  onGroupChange?: (group: Group) => void;
}

export default function GroupModerationCard({
  group,
  loading,
  onGroupChange,
}: GroupModerationCardProps) {
  const { suspendGroup, reactivateGroup } = useAdminGroupContext();
  const [suspendModalOpen, setSuspendModalOpen] = React.useState(false);

  const isSuspended = group?.status === GroupStatus.SUSPENDED;

  const handleSuspend = async () => {
    if (!group) return;
    try {
      const updated = await suspendGroup(group.uuid);
      if (updated) onGroupChange?.(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReactivate = async () => {
    if (!group) return;
    try {
      const updated = await reactivateGroup(group.uuid);
      if (updated) onGroupChange?.(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const actions: ModerationActionItem[] = [
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
              Reactivate Group
            </Button>
          ),
        }
      : {
          key: "suspend",
          primary: true,
          node: (
            <Button
              size="sm"
              leftIcon={<PauseCircle className="size-4" />}
              variant="default"
              color="warning"
              onClick={() => setSuspendModalOpen(true)}
            >
              Suspend Group
            </Button>
          ),
        },
  ];

  return (
    <>
      <ModerationActionsCard title="MODERATION" actions={actions} loading={loading || !group} />

      <Modal open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <ModalContent variant="warning">
          <ModalHeader icon={<PauseCircle />}>
            <ModalTitle>Suspend this group?</ModalTitle>
            <ModalDescription>
              <span className="font-semibold text-ink-2">{group?.name}</span> will be hidden from
              the public directory until it is reactivated.
            </ModalDescription>
          </ModalHeader>

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
              leftIcon={<PauseCircle />}
              variant="default"
              color="warning"
              onClick={() => {
                setSuspendModalOpen(false);
                void handleSuspend();
              }}
            >
              Suspend Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
