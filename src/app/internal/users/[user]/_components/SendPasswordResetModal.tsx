"use client";

import * as React from "react";
import { KeyRound, Send, X } from "lucide-react";
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
import { Typography } from "@/components/ui/Typography";

interface SendPasswordResetModalProps {
  email: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function SendPasswordResetModal({
  email,
  open,
  setOpen,
  onConfirm,
}: SendPasswordResetModalProps) {
  const handleOpenChange = (next: boolean) => setOpen(next);

  const handleConfirm = async () => {
    await onConfirm();
    handleOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="info">
        <ModalHeader icon={<KeyRound />}>
          <ModalTitle>Send password reset?</ModalTitle>
          {email && (
            <ModalDescription>
              A password-reset email will be sent to{" "}
              <Typography as="span" variant="small" className="font-semibold text-ink-2">
                {email}
              </Typography>
              . The link expires in 60 minutes.
            </ModalDescription>
          )}
        </ModalHeader>

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
            leftIcon={<Send />}
            onClick={() => void handleConfirm()}
            variant="default"
            color="info"
          >
            Send Reset Email
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
