import { Settings } from "lucide-react";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { Role } from "@/types/Role";

export function RoleCard({ row }: { row: Role }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Typography variant="small" className="font-mono font-medium text-ink-2">
              {row.role ?? NOT_APPLICABLE}
            </Typography>
            <Typography variant="muted">{row.description ?? NOT_APPLICABLE}</Typography>
          </div>
          <Button variant="icon" size="icon-sm" aria-label={`Edit ${row.role}`}>
            <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green" />
          </Button>
        </div>

        {(row.users?.length ?? 0) > 0 && (
          <div className="flex items-center gap-2 border-t border-surface-line pt-3">
            <Typography variant="muted">Users</Typography>
            <AvatarStack users={row.users ?? []} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
