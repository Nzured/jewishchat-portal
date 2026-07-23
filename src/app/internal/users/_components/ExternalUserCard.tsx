import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { USER_STATUS_CHIP, User } from "@/types/User";

export function ExternalUserCard({ row }: { row: User }) {
  return (
    <Link href={`/internal/users/${row.uuid}`} className="block">
      <Card size="sm" className="transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={row.profilePic}
              variant="tile"
              size="lg"
              name={row.firstName + row.lastName}
            />
            <div className="flex flex-col gap-0.5">
              <Typography variant="large" className="font-semibold text-ink-1">
                {(row.firstName ?? "") + " " + (row.lastName ?? "") || NOT_APPLICABLE}
              </Typography>
              <Typography variant="muted">{row.email ?? NOT_APPLICABLE}</Typography>
              {row.mobile && (
                <div className="flex items-center gap-1.5">
                  <Typography variant="muted">{row.mobile}</Typography>
                  {row.whatsappVerified && (
                    <BadgeCheck
                      className="size-4 text-state-success"
                      aria-label="WhatsApp verified"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Chip
              type={USER_STATUS_CHIP[row.status].type}
              label={USER_STATUS_CHIP[row.status].label}
              shape="pill"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
