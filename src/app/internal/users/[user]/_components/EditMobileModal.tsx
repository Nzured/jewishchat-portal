"use client";

import * as React from "react";
import { Phone, Save, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import { isValidPhone, PhoneInput } from "@/components/ui/PhoneInput";
import { Typography } from "@/components/ui/Typography";
import { User } from "@/types/User";

interface EditMobileFormValues {
  mobile: string;
}

interface EditMobileModalProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (mobile: string) => void | Promise<void>;
}

export function EditMobileModal({ user, open, setOpen, onSave }: EditMobileModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditMobileFormValues>({
    defaultValues: { mobile: user.mobile ?? "" },
    mode: "onChange",
  });

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) reset({ mobile: user.mobile ?? "" });
  }

  const mobile = watch("mobile");
  const mobileChanged = mobile !== (user.mobile ?? "");

  const handleOpenChange = (next: boolean) => setOpen(next);

  const onValid = async (values: EditMobileFormValues) => {
    await onSave(values.mobile);
    handleOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="primary" className="max-w-lg">
        <ModalHeader icon={<Phone />}>
          <ModalTitle>Edit mobile number</ModalTitle>
          <ModalDescription>
            Update the mobile number for{" "}
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {user.firstName} {user.lastName}
            </Typography>
            .
          </ModalDescription>
        </ModalHeader>

        <form id="edit-mobile-form" onSubmit={(e) => void handleSubmit(onValid)(e)}>
          <FieldGroup className="gap-4 mt-2">
            <Field data-invalid={!!errors.mobile}>
              <FieldLabel required htmlFor="edit-mobile">
                Mobile Number
              </FieldLabel>
              <Controller
                control={control}
                name="mobile"
                rules={{
                  required: "Mobile number is required",
                  validate: (value: string) =>
                    isValidPhone(value) || "Enter a valid phone number for the selected country",
                }}
                render={({ field }) => (
                  <PhoneInput
                    id="edit-mobile"
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.mobile?.message}
                    placeholder="7111223523"
                  />
                )}
              />
            </Field>

            {mobileChanged && (
              <div className="flex items-start gap-2 rounded-lg bg-state-bg-warning p-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-state-warn" />
                <Typography variant="small" className="text-state-warn">
                  Changing the mobile number to{" "}
                  <span className="font-semibold">{mobile || "—"}</span> clears its WhatsApp
                  verification — the user must re-verify before they can add groups.
                </Typography>
              </div>
            )}
          </FieldGroup>
        </form>

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
            leftIcon={<Save />}
            type="submit"
            form="edit-mobile-form"
            variant="default"
            color="primary"
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
