"use client";

import * as React from "react";
import { Check, Plus, Send, UserPlus, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
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
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { EMAIL_REGEX } from "@/configs/const";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { RoleService } from "@/services/roles/role.service";
import { Role } from "@/types/Role";
import { useUserManagementContext } from "../_context/UserManagementContext";

export interface AddInternalUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

interface AddInternalUserModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onInvite: (values: AddInternalUserFormValues) => void | Promise<void>;
}

const EMPTY_VALUES: AddInternalUserFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  roles: [],
};

const ROLE_SKELETON_WIDTHS = ["w-24", "w-20", "w-28", "w-16", "w-24"];

export function AddInternalUserModal({ open, setOpen, onInvite }: AddInternalUserModalProps) {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const { inviteInternalUser } = useUserManagementContext();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddInternalUserFormValues>({
    defaultValues: EMPTY_VALUES,
    mode: "onSubmit",
  });

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) reset(EMPTY_VALUES);
  }

  React.useEffect(() => {
    if (!open) return;
    let ignore = false;

    async function loadRoles() {
      setRolesLoading(true);
      try {
        const res = await RoleService.listRoles();
        if (!ignore) setRoles(res?.data ?? []);
      } catch {
        if (!ignore) setRoles([]);
      } finally {
        if (!ignore) setRolesLoading(false);
      }
    }

    void loadRoles();

    return () => {
      ignore = true;
    };
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset(EMPTY_VALUES);
  };

  const onValid = async (values: AddInternalUserFormValues) => {
    try {
      await inviteInternalUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        roles: values.roles,
      });

      await onInvite(values);
      handleOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="primary" className="max-w-xl">
        <ModalHeader icon={<UserPlus />}>
          <ModalTitle>Add new internal user</ModalTitle>
          <ModalDescription>
            Add a team member. They&apos;ll receive a setup email to verify their address and choose
            their own password - you don&apos;t set it here.
          </ModalDescription>
        </ModalHeader>

        <form id="add-internal-user-form" onSubmit={(e) => void handleSubmit(onValid)(e)}>
          <FieldGroup className="gap-4 mt-2">
            <Typography
              variant="tiny"
              className="font-mono font-medium tracking-[1.6px] text-ink-4"
            >
              PROFILE DETAILS
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.firstName}>
                <FieldLabel required>First Name</FieldLabel>
                <Input
                  placeholder="First Name"
                  {...register("firstName", { required: "First name is required" })}
                />
                <FieldError errors={[errors.firstName]} />
              </Field>
              <Field data-invalid={!!errors.lastName}>
                <FieldLabel required>Last Name</FieldLabel>
                <Input
                  placeholder="Last Name"
                  {...register("lastName", { required: "Last name is required" })}
                />
                <FieldError errors={[errors.lastName]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel required>Email</FieldLabel>
              <Input
                placeholder="name@jewishchat.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: EMAIL_REGEX, message: "Enter a valid email address" },
                })}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <div className="flex flex-col gap-2" data-invalid={!!errors.roles}>
              <Typography
                variant="tiny"
                className="font-mono font-medium tracking-[1.6px] text-ink-3"
              >
                ROLES <span className="text-state-danger">*</span>
              </Typography>
              <Controller
                control={control}
                name="roles"
                rules={{ validate: (value) => value.length > 0 || "Select at least one role" }}
                render={({ field }) =>
                  rolesLoading ? (
                    <div className="flex flex-wrap gap-2">
                      {ROLE_SKELETON_WIDTHS.map((width, index) => (
                        <Skeleton key={index} className={`h-8 ${width} rounded-full`} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => {
                        const isAssigned = field?.value?.includes(role.name);
                        return (
                          <Chip
                            key={role.id}
                            label={wordFormatter(role.name ?? "")}
                            shape="pill"
                            type={isAssigned ? "success" : "neutral"}
                            leftIcon={
                              isAssigned ? (
                                <Check className="size-3.5" />
                              ) : (
                                <Plus className="size-3.5" />
                              )
                            }
                            onClick={() =>
                              field.onChange(
                                isAssigned
                                  ? field.value.filter((name) => name !== role.name)
                                  : [...field.value, role.name],
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  )
                }
              />
              <FieldError errors={[errors.roles]} />
            </div>
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
            leftIcon={<Send />}
            type="submit"
            form="add-internal-user-form"
            variant="default"
            color="primary"
          >
            Send Invite
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
