"use client";

import * as React from "react";
import { Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { ModerationActionItem, ModerationActionsCard } from "@/components/ui/ModerationActionsCard";
import { Role } from "@/types/Role";

interface RoleActionsCardProps {
  role: Role | null;
  onSaveChanges: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onClearPermissions: () => void;
  saveDisabled?: boolean;
}

export function RoleActionsCard({
  role,
  onSaveChanges,
  onDelete,
  onClearPermissions,
  saveDisabled = false,
}: RoleActionsCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleDeleteConfirm = () => {
    void (async () => {
      try {
        await onDelete();
        router.push("/internal/roles");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete role");
      }
    })();
  };

  const actions: ModerationActionItem[] = [
    {
      key: "save",
      primary: true,
      node: (
        <Button
          size="sm"
          leftIcon={<Save className="size-4" />}
          variant="default"
          color="primary"
          disabled={saveDisabled}
          onClick={() => void onSaveChanges()}
        >
          Save Changes
        </Button>
      ),
    },
    {
      key: "delete",
      node: (
        <DeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button
              size="sm"
              variant="secondary"
              color="danger"
              leftIcon={<Trash2 className="size-4" />}
            >
              Delete
            </Button>
          }
          title={`Delete ${role?.name}?`}
          description="This role will be permanently removed. Users assigned to it will lose these permissions."
          onConfirm={handleDeleteConfirm}
        />
      ),
    },
    {
      key: "clear-permissions",
      node: (
        <Button
          size="sm"
          leftIcon={<X className="size-4" />}
          variant="secondary"
          color="warning"
          onClick={onClearPermissions}
        >
          Clear Permissions
        </Button>
      ),
    },
  ];

  return <ModerationActionsCard title={null} cardSize="sm" actions={actions} />;
}
