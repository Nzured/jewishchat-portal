"use client";

import * as React from "react";
import { Mail, PauseCircle, X } from "lucide-react";
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
} from "@/components/ui/Modal";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { UserService } from "@/services/user/user.service";
import { User, UserReportTypes } from "@/types/User";

interface SuspendUserModalProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuspend: (data: {
    reason: number;
    reasonLabel: string;
    remark: string;
  }) => void | Promise<void>;
}

export function SuspendUserModal({ user, open, setOpen, onSuspend }: SuspendUserModalProps) {
  const [reason, setReason] = React.useState<number>();
  const [remark, setRemark] = React.useState("");
  const [suspendTypes, setSuspendTypes] = React.useState<UserReportTypes[]>([]);
  const [suspendTypesLoading, setSuspendTypesLoading] = React.useState(true);

  React.useEffect(() => {
    if (!open) return;
    let ignore = false;

    async function loadSuspendTypes() {
      setSuspendTypesLoading(true);
      try {
        const res = await UserService.getSuspendType();
        if (!ignore) setSuspendTypes(res?.data ?? []);
      } catch {
        if (!ignore) setSuspendTypes([]);
      } finally {
        if (!ignore) setSuspendTypesLoading(false);
      }
    }

    void loadSuspendTypes();

    return () => {
      ignore = true;
    };
  }, [open]);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setReason(undefined);
      setRemark("");
    }
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
  };

  const reasonItems = suspendTypes.map((type) => ({
    value: String(type?.id),
    label: `${wordFormatter(type?.code)} - ${wordFormatter(type?.description)}`,
  }));

  const handleSuspend = async () => {
    if (!reason) return;
    const reasonLabel =
      reasonItems?.find((item) => Number(item.value) === reason)?.label ?? String(reason);
    await onSuspend({ reason, reasonLabel, remark });
    handleOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="warning">
        <ModalHeader icon={<PauseCircle />}>
          <ModalTitle>Suspend this user?</ModalTitle>
          <ModalDescription>
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {user.firstName} {user.lastName}
            </Typography>{" "}
            will lose access to the directory. They&apos;ll be emailed the category and reason below
          </ModalDescription>
        </ModalHeader>

        <FieldGroup className="gap-4 mt-2">
          <Field>
            <FieldLabel required>Reason for Suspension</FieldLabel>
            <SelectDropdown
              items={reasonItems}
              value={reason !== undefined ? String(reason) : undefined}
              onValueChange={(value) => setReason(value ? Number(value) : undefined)}
              placeholder="Select a reason"
              disabled={suspendTypesLoading}
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

          <div className="flex items-start gap-2 rounded-lg bg-surface-bg p-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-ink-3" />
            <Typography variant="small" className="text-ink-3">
              The user receives an email with this category and reason
            </Typography>
          </div>
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
            disabled={!reason}
            variant="default"
            color="warning"
          >
            Suspend User
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
