"use client";

import * as React from "react";
import { Phone, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
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
import { Typography } from "@/components/ui/Typography";
import { COUNTRY_CODES } from "@/configs/const";
import { User } from "@/types/User";

interface EditMobileFormValues {
  countryCode: string;
  mobile: string;
}

function splitMobile(mobile?: string) {
  const match = COUNTRY_CODES.find((code) => mobile?.startsWith(code.value));
  if (match) return { countryCode: match.value, mobile: mobile?.slice(match.value.length) ?? "" };
  return { countryCode: COUNTRY_CODES[0].value, mobile: mobile ?? "" };
}

interface EditMobileModalProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (mobile: string) => void | Promise<void>;
}

export function EditMobileModal({ user, open, setOpen, onSave }: EditMobileModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditMobileFormValues>({
    defaultValues: splitMobile(user.mobile),
    mode: "onChange",
  });

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) reset(splitMobile(user.mobile));
  }

  const countryCode = watch("countryCode");
  const mobile = watch("mobile");

  const mobileChanged = `${countryCode}${mobile}` !== (user.mobile ?? "");

  const handleOpenChange = (next: boolean) => setOpen(next);

  const onValid = async (values: EditMobileFormValues) => {
    await onSave(`${values.countryCode}${values.mobile}`);
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
              <FieldLabel required>Mobile Number</FieldLabel>
              <div className="flex gap-2">
                <SelectDropdown
                  items={COUNTRY_CODES}
                  value={countryCode}
                  onValueChange={(value) => setValue("countryCode", value)}
                  className="w-24 shrink-0"
                />
                <Input
                  placeholder="7111223523"
                  className="flex-1"
                  {...register("mobile", { required: "Mobile number is required" })}
                />
              </div>
              <FieldError errors={[errors.mobile]} />
            </Field>

            {mobileChanged && (
              <div className="flex items-start gap-2 rounded-lg bg-state-bg-warning p-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-state-warn" />
                <Typography variant="small" className="text-state-warn">
                  Changing the mobile number to{" "}
                  <span className="font-semibold">
                    {countryCode}
                    {mobile}
                  </span>{" "}
                  clears its WhatsApp verification — the user must re-verify before they can add
                  groups.
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
