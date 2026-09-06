"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Skeleton } from "@/components/ui/Skeleton";
import { EXTERNAL_HOME_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { UserService } from "@/services/user/user.service";
import { User } from "@/types/User";
import ProfileHeader from "./_components/Header";
import ProfileGroups from "./_components/ProfileGroups";
import YourDetails, { type ProfileDetailsDraft } from "./_components/YourDetails";

export default function ProfilePage() {
  const router = useRouter();
  const { user: sessionUser, isLoading: isSessionLoading } = useUser();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isSessionLoading && !sessionUser) router.replace("/login");
  }, [isSessionLoading, sessionUser, router]);

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

  const handleSave = (draft: ProfileDetailsDraft) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            email: draft.email,
            firstName: draft.firstName,
            lastName: draft.lastName,
            mobile: draft.mobile,
          }
        : prev,
    );
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
      />
      {isLoading && !user ? (
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
    </div>
  );
}
