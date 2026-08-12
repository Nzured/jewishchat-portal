"use client";

import * as React from "react";
import { PauseCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/Modal";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { GroupService } from "@/services/group/group.service";
import { Group } from "@/types/Group";
import { REPORT_CATEGORY_LABELS, REPORT_CATEGORY_OPTIONS, ReportCategories } from "@/types/Report";

const SUSPENSION_REASONS = REPORT_CATEGORY_OPTIONS.filter(
  (option) => option.value !== ReportCategories.RESUBMISSION_MESSAGE,
);

interface SuspendGroupModalProps {
  group: Partial<Group> & Pick<Group, "name" | "uuid">;
  trigger: React.ReactNode;
  onSuspend?: (data: {
    reason: string;
    reasonLabel: string;
    remark: string;
    group?: Group;
  }) => void;
}

export function SuspendGroupModal({ group, trigger, onSuspend }: SuspendGroupModalProps) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [remark, setRemark] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setReason("");
      setRemark("");
    }
  };

  const handleSuspend = async () => {
    if (!reason || !group?.uuid) return;
    const reasonLabel = REPORT_CATEGORY_LABELS[reason as ReportCategories] ?? reason;

    setIsSubmitting(true);
    try {
      const res = await GroupService.suspendGroup(group.uuid, {
        category: reason,
        reason: remark,
      });
      onSuspend?.({ reason, reasonLabel, remark, group: res?.data });
      handleOpenChange(false);
    } catch {
      // The axios error interceptor already surfaces a toast for this.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>{trigger}</ModalTrigger>
      <ModalContent variant="warning">
        <ModalHeader icon={<PauseCircle />}>
          <ModalTitle>Suspend this group?</ModalTitle>
          <ModalDescription>
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {group?.name ?? NOT_APPLICABLE}
            </Typography>{" "}
            will be hidden from the directory and search. The group owner will be emailed about the
            suspension.
          </ModalDescription>
        </ModalHeader>

        <FieldGroup className="gap-4 mt-2">
          <Field>
            <FieldLabel required>Reason for Suspension</FieldLabel>
            <SelectDropdown
              items={SUSPENSION_REASONS}
              value={reason}
              onValueChange={setReason}
              placeholder="Select a reason"
            />
          </Field>

          <Field>
            <FieldLabel>Remark</FieldLabel>
            <Textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder="Add an optional remark..."
            />
          </Field>
        </FieldGroup>

        <ModalFooter>
          <ModalClose asChild>
            <Button
              leftIcon={<X />}
              variant="secondary"
              color="primary"
              className="text-ink-2 hover:bg-surface-bg"
            >
              Cancel
            </Button>
          </ModalClose>
          <Button
            leftIcon={<PauseCircle />}
            onClick={() => void handleSuspend()}
            disabled={!reason || isSubmitting}
            variant="default"
            color="warning"
          >
            Suspend Group
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
