"use client";

import * as React from "react";
import { Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DeleteModal } from "@/components/ui/DeleteModal";
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

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <Button
          size={"sm"}
          variant="default"
          color="primary"
          leftIcon={<Save className="size-4" />}
          onClick={() => void onSaveChanges()}
          disabled={saveDisabled}
        >
          Save Changes
        </Button>
        <DeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button
              size={"sm"}
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

        <Button
          variant="secondary"
          color="warning"
          size={"sm"}
          leftIcon={<X className="size-4" />}
          onClick={onClearPermissions}
        >
          Clear Permissions
        </Button>
      </CardContent>
    </Card>
  );
}
