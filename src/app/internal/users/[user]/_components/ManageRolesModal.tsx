"use client";

import * as React from "react";
import { Check, Pencil, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
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
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { RoleService } from "@/services/roles/role.service";
import { Role } from "@/types/Role";

const ROLE_SKELETON_WIDTHS = ["w-24", "w-20", "w-28", "w-16", "w-24"];

interface ManageRolesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userName: string;
  assignedRoles: string[];
  onSave: (roleNames: string[]) => void;
}

export function ManageRolesModal({
  open,
  setOpen,
  userName,
  assignedRoles,
  onSave,
}: ManageRolesModalProps) {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<string>>(new Set(assignedRoles));

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setSelected(new Set(assignedRoles));
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

  const toggleRole = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleOpenChange = (next: boolean) => setOpen(next);

  const handleSave = () => {
    onSave([...selected]);
    handleOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="primary" className="max-w-md">
        <ModalHeader icon={<Pencil />}>
          <ModalTitle>Manage roles</ModalTitle>
          <ModalDescription>
            Assign or unassign roles for{" "}
            <span className="font-semibold text-ink-1">{userName}</span>. What each role can do is
            configured separately in Role Management.
          </ModalDescription>
        </ModalHeader>

        <div className="flex flex-col gap-2">
          <Typography variant="tiny" className="font-mono font-medium tracking-[1.6px] text-ink-3">
            ROLES
          </Typography>
          <div className="flex flex-wrap gap-2">
            {rolesLoading
              ? ROLE_SKELETON_WIDTHS.map((width, index) => (
                  <Skeleton key={index} className={`h-8 ${width} rounded-full`} />
                ))
              : roles.map((role) => {
                  const isAssigned = selected.has(role.name);
                  return (
                    <Chip
                      key={role.id}
                      label={wordFormatter(role.name)}
                      shape="pill"
                      type={isAssigned ? "success" : "neutral"}
                      leftIcon={
                        isAssigned ? <Check className="size-3.5" /> : <Plus className="size-3.5" />
                      }
                      onClick={() => toggleRole(role.name)}
                    />
                  );
                })}
          </div>
        </div>

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
          <Button leftIcon={<Save />} onClick={handleSave} variant="default" color="primary">
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
