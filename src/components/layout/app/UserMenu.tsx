"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Separator } from "@/components/ui/Separator";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { UserType } from "@/types/User";

export function UserMenu() {
  const router = useRouter();
  const { user } = useUser();
  const { logout } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const handleMyProfile = () => {
    if (user?.userType === UserType.INTERNAL) {
      router.push(`/internal/users/${user.id}`);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label="User menu" className="cursor-pointer rounded-full">
          <Avatar name={fullName} src={user?.profilePic} variant="circle" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <PopoverHeader className="px-2 pt-1 pb-2">
          <PopoverTitle>{fullName}</PopoverTitle>
          {user?.email && <PopoverDescription>{user.email}</PopoverDescription>}
        </PopoverHeader>
        <Separator className="mb-2" />
        <div className="flex flex-col gap-1">
          <Button
            variant="icon"
            size="sm"
            className="w-full justify-start gap-2 px-2"
            onClick={handleMyProfile}
          >
            <UserIcon className="size-4" />
            My Profile
          </Button>
          <Button
            variant="default"
            size="sm"
            color="danger"
            onClick={() => void logout()}
            leftIcon={<LogOut className="size-4" />}
          >
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
