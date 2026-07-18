"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { CreateRolePayload } from "@/types/Role";
import { useRoles } from "../_context/RoleContext";

interface AddRoleModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddRoleModal({ open, setOpen }: AddRoleModalProps) {
  const router = useRouter();
  const { createRole } = useRoles();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRolePayload>({
    defaultValues: { name: "", description: "", permissionIds: [] },
    mode: "onChange",
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const onValid = async (values: CreateRolePayload) => {
    const role = await createRole(values).catch(() => null);
    handleOpenChange(false);
    if (role) router.push(`/internal/roles/${role.id}`);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="primary">
        <ModalHeader icon={<Plus />}>
          <ModalTitle>Create Role</ModalTitle>
          <ModalDescription>
            <Typography variant="p" className="text-ink-1">
              Create new role and configure permissions next.
            </Typography>
          </ModalDescription>
        </ModalHeader>

        <form id="add-role-form" onSubmit={(e) => void handleSubmit(onValid)(e)}>
          <FieldGroup className="gap-4 mt-2">
            <Field data-invalid={!!errors.name}>
              <FieldLabel required>Role Name</FieldLabel>
              <Input
                placeholder="Role Name"
                {...register("name", { required: "Role name is required" })}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea placeholder="What this role is for...." {...register("description")} />
            </Field>
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
            leftIcon={<Plus />}
            type="submit"
            form="add-role-form"
            variant="default"
            color="primary"
          >
            Create & set permissions
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
