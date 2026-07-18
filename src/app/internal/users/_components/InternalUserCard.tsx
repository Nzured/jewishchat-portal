import { Eye, Settings, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { UserRow } from "./UserRow";

export function InternalUserCard({ row }: { row: UserRow }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={row.profilePic} variant="tile" name={row.firstName + row.lastName} />
            <div className="flex flex-col">
              <Typography variant="small" className="font-semibold text-ink-1">
                {(row.firstName ?? "") + " " + (row.lastName ?? "") || NOT_APPLICABLE}
              </Typography>
              <Typography variant="muted">{row.email ?? NOT_APPLICABLE}</Typography>
            </div>
          </div>
          <Chip label={row.role ?? NOT_APPLICABLE} shape="pill" type="neutral" />
        </div>

        <div className="flex items-center justify-end border-t border-surface-line pt-3">
          <div className="flex items-center gap-1">
            <Button variant="icon" size="icon-sm" aria-label={`View ${row.firstName}`}>
              <Eye className="text-ink-3 transition-colors group-hover/button:text-brand-green" />
            </Button>
            <Button variant="icon" size="icon-sm" aria-label={`Edit ${row.firstName}`}>
              <Settings className="text-ink-3 transition-colors group-hover/button:text-brand-green" />
            </Button>
            <Button
              variant="icon"
              size="icon-sm"
              aria-label={`Delete ${row.firstName}`}
              className="hover:bg-state-danger/10 hover:text-state-danger"
            >
              <Trash2 className="text-ink-3 transition-colors group-hover/button:text-state-danger" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
