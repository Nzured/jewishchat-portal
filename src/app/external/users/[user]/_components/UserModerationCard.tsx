"use client";

import { useState } from "react";
import { KeyRound, Pencil, PauseCircle, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { UserStatus } from "@/types/User";
import { UserRow } from "../../_components/UserRow";

interface UserModerationCardProps {
  user: UserRow;
}

export default function UserModerationCard({ user }: UserModerationCardProps) {
  const [status, setStatus] = useState(user.status);

  return (
    <Card>
      <CardHeader>
        <Typography variant="tiny" className="font-mono font-medium tracking-[1.6px] text-ink-3">
          MODERATION
        </Typography>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pt-0">
        {status === UserStatus.SUSPENDED ? (
          <Button
            size="sm"
            variant="default"
            color="primary"
            leftIcon={<RefreshCw className="size-4" />}
            onClick={() => setStatus(UserStatus.ACTIVE)}
          >
            Reactivate User
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            color="warning"
            leftIcon={<PauseCircle className="size-4" />}
            onClick={() => setStatus(UserStatus.SUSPENDED)}
          >
            Suspend User
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          color="danger"
          leftIcon={<Trash2 className="size-4" />}
        >
          Permanently Delete
        </Button>

        <Separator className="my-1" />

        <Button
          size="sm"
          variant="secondary"
          color="info"
          leftIcon={<KeyRound className="size-4" />}
          className="justify-start"
        >
          Reset Password
        </Button>

        <Button
          size="sm"
          variant="secondary"
          color="warning"
          leftIcon={<Pencil className="size-4" />}
          className="justify-start"
        >
          Edit email / phone
        </Button>
      </CardContent>
    </Card>
  );
}
