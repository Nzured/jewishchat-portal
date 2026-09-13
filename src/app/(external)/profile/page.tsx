"use client";

import * as React from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ChangePhotoModal } from "@/components/ui/ChangePhotoModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EXTERNAL_HOME_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { UserService } from "@/services/user/user.service";
import { User } from "@/types/User";
import ProfileHeader from "./_components/Header";
import ProfileGroups from "./_components/ProfileGroups";
import { VerifyWhatsappModal } from "./_components/VerifyWhatsappModal";
import YourDetails, { type ProfileDetailsDraft } from "./_components/YourDetails";

export default function ProfilePage() {
  const { user: sessionUser, refetchUser } = useUser();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = React.useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = React.useState(false);

  React.useEffect(() => {
    const uuid = sessionUser?.uuid;
    if (!uuid) return;
    let ignore = false;

    UserService.getUserById(uuid)
      .then((res) => {
        if (!ignore) setUser(res?.data ?? null);
      })
      .catch(() => {
        if (!ignore) setUser(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [sessionUser?.uuid]);

  const details = user ?? sessionUser;

  const startWhatsappVerification = async () => {
    await UserService.requestWhatsappVerification();
    setIsWhatsappModalOpen(true);
  };

  const refreshUser = async () => {
    const uuid = sessionUser?.uuid;
    if (uuid) {
      const refreshed = await UserService.getUserById(uuid);
      if (refreshed?.data) setUser(refreshed.data);
    }
    await refetchUser();
  };

  const handleSave = async (draft: ProfileDetailsDraft) => {
    const { data } = await UserService.updateMyProfile(draft);
    setUser((prev) => (prev ? { ...prev, ...draft, ...data } : prev));
    await refetchUser();
    toast.success("Your details have been updated.");

    if (data && !data.whatsappVerified) await startWhatsappVerification();
  };

  const handleWhatsappVerified = () => refreshUser();

  const handlePhotoSave = async (photo: File) => {
    const { data } = await UserService.getProfilePictureUploadUrl();
    await UserService.uploadProfilePicture(data.uploadUrl, photo);
    await UserService.confirmProfilePicture(data.fileKey);
    await refreshUser();
    toast.success("Your profile photo has been updated.");
  };

  if (!details) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Home", href: EXTERNAL_HOME_PATH }, { label: "My Profile" }]}
        />
        <Skeleton className="h-40 w-full rounded-lg" />
      </>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Breadcrumbs items={[{ label: "Home", href: EXTERNAL_HOME_PATH }, { label: "My Profile" }]} />
      <ProfileHeader
        name={`${details.firstName} ${details.lastName}`.trim()}
        email={details.email}
        avatarUrl={details.profilePic}
        emailVerified={details.emailVerified}
        whatsappNumber={details.mobile}
        whatsappVerified={details.whatsappVerified}
        onChangePhoto={() => setIsPhotoModalOpen(true)}
        onVerifyWhatsapp={() => void startWhatsappVerification()}
      />
      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : (
        <YourDetails
          email={details.email}
          firstName={details.firstName}
          lastName={details.lastName}
          mobile={details.mobile}
          emailVerified={details.emailVerified}
          whatsappVerified={details.whatsappVerified}
          onSave={handleSave}
        />
      )}
      <ProfileGroups userUuid={details.uuid} />
      <ChangePhotoModal
        open={isPhotoModalOpen}
        onOpenChange={setIsPhotoModalOpen}
        title="Change profile photo"
        hint="JPG, PNG or WebP. Drag to reposition and zoom to crop."
        crop
        circular
        aspect={1}
        onSave={handlePhotoSave}
      />
      <VerifyWhatsappModal
        open={isWhatsappModalOpen}
        onOpenChange={setIsWhatsappModalOpen}
        mobile={details.mobile}
        onVerified={handleWhatsappVerified}
      />
    </div>
  );
}
