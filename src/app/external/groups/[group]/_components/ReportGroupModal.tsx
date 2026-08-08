"use client";

import * as React from "react";
import { Flag, X } from "lucide-react";
import { toast } from "sonner";
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
import { ReportCategories } from "@/types/Report";

const REPORT_REASONS = [
  { value: ReportCategories.LINK_NOT_WORKING, label: "Link not working" },
  { value: ReportCategories.INAPPROPRIATE_CONTENT, label: "Inappropriate content" },
  { value: ReportCategories.RESUBMISSION_MESSAGE, label: "Resubmission message" },
];

interface ReportGroupModalProps {
  groupUuid: string;
  groupName?: string;
  trigger: React.ReactNode;
}

export function ReportGroupModal({ groupUuid, groupName, trigger }: ReportGroupModalProps) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<ReportCategories | "">("");
  const [remark, setRemark] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setReason("");
      setRemark("");
    }
  };

  const handleReport = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await GroupService.reportGroup(groupUuid, {
        category: reason,
        description: remark || undefined,
      });
      toast.success("Thanks — our moderators will take a look at this group.");
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
      <ModalContent variant="danger">
        <ModalHeader icon={<Flag />}>
          <ModalTitle>Report this group?</ModalTitle>
          <ModalDescription>
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {groupName ?? NOT_APPLICABLE}
            </Typography>{" "}
            will be sent to our moderators for review. They&apos;ll take a look and follow up if
            needed.
          </ModalDescription>
        </ModalHeader>

        <FieldGroup className="gap-4 mt-2">
          <Field>
            <FieldLabel required>Reason for report</FieldLabel>
            <SelectDropdown
              items={REPORT_REASONS}
              value={reason}
              onValueChange={(value) => setReason(value as ReportCategories)}
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
            leftIcon={<Flag />}
            onClick={() => void handleReport()}
            disabled={!reason || isSubmitting}
            variant="default"
            color="danger"
          >
            Report Group
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
