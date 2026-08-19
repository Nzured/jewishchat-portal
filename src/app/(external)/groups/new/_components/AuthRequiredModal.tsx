"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/Modal";

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: () => void;
  onLogIn: () => void;
}

export default function AuthRequiredModal({
  open,
  onOpenChange,
  onCreateAccount,
  onLogIn,
}: AuthRequiredModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="items-center text-center">
        <div className="flex w-full flex-col items-center gap-4 pt-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-state-bg-success text-state-success">
            <User className="size-5" />
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <ModalTitle className="text-xl">Almost there</ModalTitle>
            <ModalDescription>
              Your group details are saved. Sign in or create an account so you can manage this
              listing later.
            </ModalDescription>
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col gap-2.5">
          <Button type="button" className="w-full" onClick={onCreateAccount}>
            Create an account
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={onLogIn}>
            I already have an account
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
