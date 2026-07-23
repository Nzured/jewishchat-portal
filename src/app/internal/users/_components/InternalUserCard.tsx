import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { User } from "@/types/User";
import { RoleChips } from "./RoleChips";

export function InternalUserCard({ row }: { row: User }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={row.profilePic} variant="tile" name={row.firstName + row.lastName} />
            <div className="flex flex-col">
              <Typography variant="large" className="font-semibold text-ink-1">
                {(row.firstName ?? "") + " " + (row.lastName ?? "") || NOT_APPLICABLE}
              </Typography>
              <Typography variant="muted">{row.email ?? NOT_APPLICABLE}</Typography>
            </div>
          </div>
          <RoleChips roles={row.roles} />
        </div>
      </CardContent>
    </Card>
  );
}
