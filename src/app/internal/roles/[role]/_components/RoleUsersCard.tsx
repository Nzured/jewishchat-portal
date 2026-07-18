"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { Role } from "@/types/Role";

interface RoleUsersCardProps {
  role: Role;
}

export function RoleUsersCard({ role }: RoleUsersCardProps) {
  const router = useRouter();
  const users = role.users ?? [];

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Typography variant="small" className="font-semibold text-ink-1">
            {users.length} users with this role
          </Typography>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Users className="size-3.5" />}
            onClick={() => router.push("/external/users")}
          >
            Manage users
          </Button>
        </div>

        {users.length > 0 && (
          <div className="flex flex-col gap-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2.5">
                <Avatar variant="circle" size="sm" name={user.name} src={user.profilePic} />
                <Typography variant="small" className="font-medium text-ink-1">
                  {user.name}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
