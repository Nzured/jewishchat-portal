import { CalendarDays, CheckCheck, Clock, Mail, Minus, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { UserRow } from "../../_components/UserRow";

interface AccountDetailsCardProps {
  user: UserRow;
  lastActive: string;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function DetailRow({ icon, label, children }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-2 text-ink-3">
        <span className="size-4 shrink-0">{icon}</span>
        <Typography variant="small" className="text-ink-3">
          {label}
        </Typography>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export default function AccountDetailsCard({ user, lastActive }: AccountDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <Typography variant="tiny" className="font-mono font-medium tracking-[1.6px] text-ink-4">
          ACCOUNT DETAILS
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-col pt-0">
        <DetailRow icon={<Mail className="size-4" />} label="Email">
          <Typography variant="small" className="text-ink-1 font-medium">
            {user.email ?? NOT_APPLICABLE}
          </Typography>
        </DetailRow>

        <Separator />

        <DetailRow icon={<Phone className="size-4" />} label="Mobile">
          {user.mobile ? (
            <>
              <Typography variant="small" className="text-ink-1 font-medium">
                {user.mobile}
              </Typography>
              <Chip
                label={user.mobileNumberVerified ? "Verified" : "Not Verified"}
                shape="pill"
                type={user.mobileNumberVerified ? "success" : "neutral"}
                leftIcon={user.mobileNumberVerified ? <CheckCheck /> : <Minus />}
              />
            </>
          ) : (
            <Typography variant="small" className="text-ink-4">
              {NOT_APPLICABLE}
            </Typography>
          )}
        </DetailRow>

        <Separator />

        <DetailRow icon={<CalendarDays className="size-4" />} label="Joined">
          <Typography variant="small" className="text-ink-1 font-medium">
            {user.joinedDate ?? NOT_APPLICABLE}
          </Typography>
        </DetailRow>

        <Separator />

        <DetailRow icon={<Clock className="size-4" />} label="Last active">
          <Typography variant="small" className="text-ink-1 font-medium">
            {lastActive}
          </Typography>
        </DetailRow>
      </CardContent>
    </Card>
  );
}
