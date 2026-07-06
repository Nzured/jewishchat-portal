"use client";

import * as React from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  const handleConfirm = () => {
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
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
