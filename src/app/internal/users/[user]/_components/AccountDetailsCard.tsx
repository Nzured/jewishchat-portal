import { CheckCheck, Mail, Minus, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { NOT_APPLICABLE } from "@/configs/const";
import { User } from "@/types/User";

interface AccountDetailsCardProps {
  user?: User | null;
  loading?: boolean;
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

function DetailRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

export default function AccountDetailsCard({ user, loading }: AccountDetailsCardProps) {
  const showSkeleton = loading || !user;

  return (
    <Card>
      <CardHeader>
        <Typography variant="tiny" className="font-mono font-medium tracking-[1.6px] text-ink-4">
          ACCOUNT DETAILS
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-col pt-0">
        {showSkeleton ? (
          <>
            <DetailRowSkeleton />
            <Separator />
            <DetailRowSkeleton />
          </>
        ) : (
          <>
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
                    label={user.whatsappVerified ? "Verified" : "Not Verified"}
                    shape="pill"
                    type={user.whatsappVerified ? "success" : "neutral"}
                    leftIcon={user.whatsappVerified ? <CheckCheck /> : <Minus />}
                  />
                </>
              ) : (
                <Typography variant="small" className="text-ink-4">
                  {NOT_APPLICABLE}
                </Typography>
              )}
            </DetailRow>
          </>
        )}
      </CardContent>
    </Card>
  );
}
