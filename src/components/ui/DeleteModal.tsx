"use client";

import * as React from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
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

const CONFIRM_KEYWORD = "DELETE";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

export function DeleteModal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Delete Permanently",
  cancelLabel = "Cancel",
  onConfirm,
}: DeleteModalProps) {
  const [confirmText, setConfirmText] = React.useState("");

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setConfirmText("");
  }

  const canConfirm = confirmText === CONFIRM_KEYWORD;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {trigger && <ModalTrigger asChild>{trigger}</ModalTrigger>}
      <ModalContent variant="danger">
        <ModalHeader icon={<Trash2 />}>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>

        <Field>
          <FieldLabel>
            Type <span className="font-semibold text-ink-1">{CONFIRM_KEYWORD}</span> to confirm
          </FieldLabel>
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={CONFIRM_KEYWORD}
            autoComplete="off"
          />
        </Field>

        <ModalFooter>
          <ModalClose asChild>
            <Button
              size="sm"
              leftIcon={<X />}
              variant="secondary"
              color="primary"
              className="text-ink-2 hover:bg-surface-bg"
            >
              {cancelLabel}
            </Button>
          </ModalClose>
          <Button
            size="sm"
            onClick={handleConfirm}
            leftIcon={<Trash2 />}
            variant="default"
            color="danger"
            disabled={!canConfirm}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
