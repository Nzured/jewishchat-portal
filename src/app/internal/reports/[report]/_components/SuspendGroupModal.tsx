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
import { Group } from "@/types/Group";

const SUSPENSION_REASONS = [
  { value: "inappropriate-content", label: "Inappropriate Content" },
  { value: "spam-or-scams", label: "Spam or Scams" },
  { value: "repeated-violations", label: "Repeated Violations" },
  { value: "inactive-group", label: "Inactive Group" },
  { value: "other", label: "Other" },
];

interface SuspendGroupModalProps {
  group: Group;
  trigger: React.ReactNode;
  onSuspend?: (data: { reason: string; reasonLabel: string; remark: string }) => void;
}

export function SuspendGroupModal({ group, trigger, onSuspend }: SuspendGroupModalProps) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [remark, setRemark] = React.useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setReason("");
      setRemark("");
    }
  };

  const handleSuspend = () => {
    if (!reason) return;
    const reasonLabel = SUSPENSION_REASONS.find((item) => item.value === reason)?.label ?? reason;
    onSuspend?.({ reason, reasonLabel, remark });
    handleOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalTrigger asChild>{trigger}</ModalTrigger>
      <ModalContent variant="warning">
        <ModalHeader icon={<PauseCircle />}>
          <ModalTitle>Suspend this group?</ModalTitle>
          <ModalDescription>
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {group.groupName}
            </Typography>{" "}
            will be hidden from the directory and search. The group owner (
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {group.createdBy.name}
            </Typography>
            ) will be emailed about the suspension.
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
            onClick={handleSuspend}
            disabled={!reason}
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
