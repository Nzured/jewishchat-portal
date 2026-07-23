"use client";

import { useEffect, useState } from "react";
import { KeyRound, Mail, PauseCircle, Phone, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { ModerationActionItem, ModerationActionsCard } from "@/components/ui/ModerationActionsCard";
import { useUser } from "@/contexts/UserContext";
import { AuthService } from "@/services/auth/auth.service";
import { User, UserStatus, UserType } from "@/types/User";
import { EditEmailModal } from "./EditEmailModal";
import { EditMobileModal } from "./EditMobileModal";
import { SendPasswordResetModal } from "./SendPasswordResetModal";
import { SuspendUserModal } from "./SuspendUserModal";
import { useUserManagementContext } from "../../_context/UserManagementContext";

interface UserModerationCardProps {
  user?: User | null;
  loading?: boolean;
  onUserChange?: (user: User) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

export default function UserModerationCard({
  user,
  loading,
  onUserChange,
  onVisibilityChange,
}: UserModerationCardProps) {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { deleteUser, suspendUser, reactivateUser, changeEmail, changeMobile } =
    useUserManagementContext();
  const isSelf = Boolean(currentUser && user && currentUser.uuid === user.uuid);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editEmailModalOpen, setEditEmailModalOpen] = useState(false);
  const [editMobileModalOpen, setEditMobileModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteUser(user.uuid);
      router.push("/internal/users");
    } catch (error) {
      console.error(error);
    }
  };

  const handleReactivate = async () => {
    if (!user) return;
    try {
      const updatedUser = await reactivateUser(user.uuid);
      if (updatedUser) onUserChange?.(updatedUser);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuspend = async (data: { reason: number; reasonLabel: string; remark: string }) => {
    if (!user) return;
    try {
      const updatedUser = await suspendUser(user.uuid, {
        suspendTypeId: data.reason,
        reason: data.remark,
      });
      if (updatedUser) onUserChange?.(updatedUser);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user) return;
    try {
      await AuthService.forgotPassword({ email: user.email });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveEmail = async (email: string) => {
    if (!user) return;
    try {
      const updatedUser = await changeEmail(user.uuid, email);
      if (updatedUser) onUserChange?.(updatedUser);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveMobile = async (mobile: string) => {
    if (!user) return;
    try {
      const updatedUser = await changeMobile(user.uuid, mobile);
      if (updatedUser) onUserChange?.(updatedUser);
    } catch (error) {
      console.error(error);
    }
  };

  const showSkeleton = loading || !user;

  const actions: ModerationActionItem[] = [
    user?.status === UserStatus.SUSPENDED
      ? {
          key: "reactivate",
          primary: true,
          hidden: isSelf || user?.userType === UserType.INTERNAL || user?.superAdmin,
          node: (
            <Button
              size="sm"
              leftIcon={<RefreshCw className="size-4" />}
              variant="default"
              color="primary"
              onClick={() => void handleReactivate()}
            >
              Reactivate User
            </Button>
          ),
        }
      : {
          key: "suspend",
          primary: true,
          hidden: isSelf || user?.userType === UserType.INTERNAL || user?.superAdmin,
          node: (
            <Button
              size="sm"
              leftIcon={<PauseCircle className="size-4" />}
              variant="default"
              color="warning"
              onClick={() => setSuspendModalOpen(true)}
            >
              Suspend User
            </Button>
          ),
        },
    {
      key: "delete",
      hidden: isSelf || user?.superAdmin,
      node: (
        <Button
          size="sm"
          leftIcon={<Trash2 className="size-4" />}
          variant="secondary"
          color="danger"
          onClick={() => setDeleteModalOpen(true)}
        >
          Permanently Delete
        </Button>
      ),
    },
    {
      key: "separator",
      type: "separator",
      hidden: isSelf || user?.status === UserStatus.PENDING_INVITATION || user?.superAdmin,
    },
    {
      key: "reset-password",
      hidden: isSelf || user?.status === UserStatus.PENDING_INVITATION || user?.superAdmin,
      node: (
        <Button
          size="sm"
          leftIcon={<KeyRound className="size-4" />}
          variant="secondary"
          color="info"
          className="justify-start"
          onClick={() => setResetModalOpen(true)}
        >
          Reset Password
        </Button>
      ),
    },
    {
      key: "edit-email",
      hidden: user?.status === UserStatus.PENDING_INVITATION || user?.superAdmin,
      node: (
        <Button
          size="sm"
          leftIcon={<Mail className="size-4" />}
          variant="secondary"
          color="warning"
          className="justify-start"
          onClick={() => setEditEmailModalOpen(true)}
        >
          Edit Email
        </Button>
      ),
    },
    {
      key: "edit-mobile",
      hidden: user?.userType === UserType.INTERNAL || user?.superAdmin,
      node: (
        <Button
          size="sm"
          leftIcon={<Phone className="size-4" />}
          variant="secondary"
          color="info"
          className="justify-start"
          onClick={() => setEditMobileModalOpen(true)}
        >
          Edit Mobile Number
        </Button>
      ),
    },
  ];

  const hasVisibleActions = actions.some(
    (action) => !action.hidden && !("type" in action && action.type === "separator"),
  );
  const isVisible = showSkeleton || hasVisibleActions;

  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  if (!isVisible) return null;

  return (
    <>
      <ModerationActionsCard actions={actions} loading={showSkeleton} />

      {user && (
        <DeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Permanently delete this user?"
          description={
            <>
              This cannot be undone. It permanently removes{" "}
              <span className="font-semibold text-ink-2">
                {user.firstName} {user.lastName}
              </span>{" "}
              and all their account data.
            </>
          }
          onConfirm={() => void handleDelete()}
        />
      )}

      {user && (
        <SuspendUserModal
          user={user}
          open={suspendModalOpen}
          setOpen={setSuspendModalOpen}
          onSuspend={handleSuspend}
        />
      )}

      {user && (
        <SendPasswordResetModal
          email={user.email}
          open={resetModalOpen}
          setOpen={setResetModalOpen}
          onConfirm={handleSendPasswordReset}
        />
      )}

      {user && (
        <EditEmailModal
          user={user}
          open={editEmailModalOpen}
          setOpen={setEditEmailModalOpen}
          onSave={handleSaveEmail}
        />
      )}

      {user && (
        <EditMobileModal
          user={user}
          open={editMobileModalOpen}
          setOpen={setEditMobileModalOpen}
          onSave={handleSaveMobile}
        />
      )}
    </>
  );
}
