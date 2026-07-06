"use client";

import * as React from "react";
import { Save, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Role } from "@/types/Role";

interface RoleActionsCardProps {
  role: Role;
  onSaveChanges: () => void;
  onClearPermissions: () => void;
}

export function RoleActionsCard({ role, onSaveChanges, onClearPermissions }: RoleActionsCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <Button
          size={"sm"}
          variant="default"
          color="primary"
          leftIcon={<Save className="size-4" />}
          onClick={onSaveChanges}
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
          title={`Delete ${role.role}?`}
          description="This role will be permanently removed. Users assigned to it will lose these permissions."
          onConfirm={() => router.push("/external/roles")}
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
