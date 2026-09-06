"use client";

import * as React from "react";
import { Lock, Mail, Smartphone, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { PhoneInput, isValidPhone } from "@/components/ui/PhoneInput";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { EMAIL_REGEX, NOT_APPLICABLE } from "@/configs/const";
import { cn } from "@/lib/utils";

const editFieldClassName = "max-w-sm";

function EditField({ children }: { children: React.ReactNode }) {
  return <div className={editFieldClassName}>{children}</div>;
}

export interface ProfileDetailsDraft {
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  password?: string;
}

interface YourDetailsProps {
  email?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  emailVerified?: boolean;
  whatsappVerified?: boolean;
  onSave?: (draft: ProfileDetailsDraft) => void | Promise<void>;
  className?: string;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function DetailRow({ icon, label, children, action }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-state-bg-success text-brand-deep [&_svg]:size-4">
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography variant="tiny" className="font-mono tracking-[1.2px] text-ink-4 uppercase">
            {label}
          </Typography>
          {children}
        </div>
      </div>
      {action}
    </div>
  );
}

function ReadValue({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="small" className="truncate font-medium text-ink-1">
      {children}
    </Typography>
  );
}

export default function YourDetails({
  email,
  firstName,
  lastName,
  mobile,
  emailVerified = false,
  whatsappVerified = false,
  onSave,
  className,
}: YourDetailsProps) {
  const toDraft = React.useCallback(
    (): ProfileDetailsDraft => ({
      email: email ?? "",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      mobile: mobile ?? "",
      password: "",
    }),
    [email, firstName, lastName, mobile],
  );

  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [draft, setDraft] = React.useState<ProfileDetailsDraft>(toDraft);
  const [errors, setErrors] = React.useState<Partial<Record<keyof ProfileDetailsDraft, string>>>(
    {},
  );

  const setField = (field: keyof ProfileDetailsDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const startEditing = () => {
    setDraft(toDraft());
    setErrors({});
    setIsEditing(true);
  };

  const discard = () => {
    setDraft(toDraft());
    setErrors({});
    setIsEditing(false);
  };

  const save = async () => {
    const nextErrors: Partial<Record<keyof ProfileDetailsDraft, string>> = {};
    if (!EMAIL_REGEX.test(draft.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!draft.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!draft.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (draft.mobile && !isValidPhone(draft.mobile)) {
      nextErrors.mobile = "Enter a valid mobile number.";
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const payload: ProfileDetailsDraft = {
      email: draft.email.trim(),
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      mobile: draft.mobile,
      ...(draft.password ? { password: draft.password } : {}),
    };

    try {
      setIsSaving(true);
      await onSave?.(payload);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <Typography
          variant="tiny"
          className="font-mono tracking-[1.6px] text-brand-green uppercase"
        >
          Account
        </Typography>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Typography variant="h2" className="font-display font-bold">
              Your details
            </Typography>
            <Typography variant="muted" className="max-w-md">
              The information tied to your login. Changing your email or number re-triggers its
              verification.
            </Typography>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={() => void save()} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  color="primary"
                  onClick={discard}
                  disabled={isSaving}
                >
                  Discard
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={startEditing}>
                Edit details
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="gap-0 py-0">
        <DetailRow
          icon={<Mail />}
          label="Email address"
          action={
            !isEditing && (
              <Chip
                label={emailVerified ? "Verified" : "Not verified"}
                type={emailVerified ? "success" : "warning"}
              />
            )
          }
        >
          {isEditing ? (
            <EditField>
              <Input
                type="email"
                aria-label="Email address"
                value={draft.email}
                error={errors.email}
                onChange={(event) => setField("email", event.target.value)}
              />
            </EditField>
          ) : (
            <ReadValue>{email || NOT_APPLICABLE}</ReadValue>
          )}
        </DetailRow>

        <Separator />

        <DetailRow icon={<UserIcon />} label="First name">
          {isEditing ? (
            <EditField>
              <Input
                aria-label="First name"
                value={draft.firstName}
                error={errors.firstName}
                onChange={(event) => setField("firstName", event.target.value)}
              />
            </EditField>
          ) : (
            <ReadValue>{firstName || NOT_APPLICABLE}</ReadValue>
          )}
        </DetailRow>

        <Separator />

        <DetailRow icon={<UserIcon />} label="Last name">
          {isEditing ? (
            <EditField>
              <Input
                aria-label="Last name"
                value={draft.lastName}
                error={errors.lastName}
                onChange={(event) => setField("lastName", event.target.value)}
              />
            </EditField>
          ) : (
            <ReadValue>{lastName || NOT_APPLICABLE}</ReadValue>
          )}
        </DetailRow>

        <Separator />

        <DetailRow icon={<Lock />} label="Password">
          {isEditing ? (
            <EditField>
              <Input
                type="password"
                aria-label="New password"
                placeholder="Leave blank to keep current password"
                value={draft.password ?? ""}
                error={errors.password}
                onChange={(event) => setField("password", event.target.value)}
              />
            </EditField>
          ) : (
            <ReadValue>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</ReadValue>
          )}
        </DetailRow>

        <Separator />

        <DetailRow
          icon={<Smartphone />}
          label="Mobile number"
          action={
            !isEditing &&
            Boolean(mobile) && (
              <Chip
                label={whatsappVerified ? "Verified" : "Not verified"}
                type={whatsappVerified ? "success" : "warning"}
              />
            )
          }
        >
          {isEditing ? (
            <PhoneInput
              className={editFieldClassName}
              value={draft.mobile}
              error={errors.mobile}
              onValueChange={(value) => setField("mobile", value)}
            />
          ) : (
            <ReadValue>{mobile || NOT_APPLICABLE}</ReadValue>
          )}
        </DetailRow>
      </Card>
    </section>
  );
}
