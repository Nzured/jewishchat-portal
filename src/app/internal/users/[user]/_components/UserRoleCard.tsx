import { UserLock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { wordFormatter } from "@/configs/functions/WordFormatter";

export default function UserRoleCard({
  roles,
  onManageRolesClick,
}: {
  roles: string[];
  onManageRolesClick?: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Typography variant={"tiny"} className="text-ink-3 font-mono font-medium tracking-[1.6px]">
          ROLES
        </Typography>
        <Button
          onClick={onManageRolesClick}
          leftIcon={<UserLock />}
          variant={"secondary"}
          size={"sm"}
        >
          <Typography>Manage Roles</Typography>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          {roles?.map((role) => (
            <Chip key={role} label={wordFormatter(role)} shape="pill" type="success" />
          ))}
        </div>
        <Typography variant={"muted"}>
          What each role can do is defined in Role Management. Only the assigned roles are shown
          here.
        </Typography>
      </CardContent>
    </Card>
  );
}
