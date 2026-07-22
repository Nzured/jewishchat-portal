"use client";

import * as React from "react";
import { Mail, Pencil, Save, X } from "lucide-react";
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
import { Typography } from "@/components/ui/Typography";
import { EMAIL_CHECK_DEBOUNCE_MS, EMAIL_EXISTS_MESSAGE, EMAIL_REGEX } from "@/configs/const";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AuthService } from "@/services/auth/auth.service";
import { User } from "@/types/User";

interface EditEmailFormValues {
  email: string;
}

interface EditEmailModalProps {
  user: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (email: string) => void | Promise<void>;
}

export function EditEmailModal({ user, open, setOpen, onSave }: EditEmailModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditEmailFormValues>({
    defaultValues: { email: user.email },
    mode: "onChange",
  });

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) reset({ email: user.email });
  }

  const email = watch("email");
  const emailChanged = email !== user.email;

  const debouncedEmail = useDebouncedValue(email, EMAIL_CHECK_DEBOUNCE_MS);
  const emailExistsCacheRef = React.useRef<{ email: string; exists: boolean } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false);

  const checkEmailExists = async (candidateEmail: string): Promise<boolean> => {
    if (candidateEmail === user.email) return false;
    if (emailExistsCacheRef.current?.email === candidateEmail) {
      return emailExistsCacheRef.current.exists;
    }

    const res = await AuthService.getUserType({ email: candidateEmail }).catch(() => null);
    const exists = Boolean(res?.data?.userType);
    emailExistsCacheRef.current = { email: candidateEmail, exists };
    return exists;
  };

  const clearExistsError = () => {
    if (errors.email?.type === "manual") clearErrors("email");
  };

  React.useEffect(() => {
    if (!debouncedEmail || !EMAIL_REGEX.test(debouncedEmail) || debouncedEmail === user.email) {
      clearExistsError();
      return;
    }

    void (async () => {
      setIsCheckingEmail(true);
      try {
        const exists = await checkEmailExists(debouncedEmail);
        if (exists) {
          setError("email", { type: "manual", message: EMAIL_EXISTS_MESSAGE });
        } else {
          clearExistsError();
        }
      } finally {
        setIsCheckingEmail(false);
      }
    })();
  }, [debouncedEmail, user.email]);

  const handleOpenChange = (next: boolean) => setOpen(next);

  const onValid = async (values: EditEmailFormValues) => {
    const exists = await checkEmailExists(values.email);
    if (exists) {
      setError("email", { type: "manual", message: EMAIL_EXISTS_MESSAGE });
      return;
    }

    await onSave(values.email);
    handleOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="primary" className="max-w-lg">
        <ModalHeader icon={<Pencil />}>
          <ModalTitle>Edit email</ModalTitle>
          <ModalDescription>
            Update the sign-in email for{" "}
            <Typography as="span" variant="small" className="font-semibold text-ink-2">
              {user.firstName} {user.lastName}
            </Typography>
            .
          </ModalDescription>
        </ModalHeader>

        <form id="edit-email-form" onSubmit={(e) => void handleSubmit(onValid)(e)}>
          <FieldGroup className="gap-4 mt-2">
            <Field data-invalid={!!errors.email}>
              <FieldLabel required>Email</FieldLabel>
              <Input
                placeholder="name@example.com"
                loading={isCheckingEmail}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: EMAIL_REGEX, message: "Enter a valid email address" },
                })}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            {emailChanged && (
              <div className="flex items-start gap-2 rounded-lg bg-state-bg-warning p-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-state-warn" />
                <Typography variant="small" className="text-state-warn">
                  A verification email will be sent to{" "}
                  <span className="font-semibold">{email}</span>. The user must re-verify before it
                  becomes their sign-in email.
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
            form="edit-email-form"
            variant="default"
            color="primary"
            disabled={isCheckingEmail || errors.email?.type === "manual"}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
