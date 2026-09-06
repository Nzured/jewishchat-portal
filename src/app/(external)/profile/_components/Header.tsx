"use client";

import { AlertTriangle, ArrowRight, BadgeCheck, CalendarDays, CircleAlert } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { formatDate, isValidDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ConfigType } from "dayjs";

const flatChipClassName = "border-transparent bg-transparent px-0 py-0";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  whatsappNumber?: string;
  whatsappVerified?: boolean;
  memberSince?: ConfigType;
  onVerifyWhatsapp?: () => void;
  className?: string;
}

export default function ProfileHeader({
  name,
  email,
  avatarUrl,
  emailVerified = false,
  whatsappNumber,
  whatsappVerified = false,
  memberSince,
  onVerifyWhatsapp,
  className,
}: ProfileHeaderProps) {
  const memberSinceLabel = isValidDate(memberSince)
    ? formatDate(memberSince, "MMM D, YYYY, h:mm A")
    : null;

  return (
    <div className={cn("flex flex-col gap-4 bw-1", className)}>
      <div className="relative overflow-hidden rounded-lg">
        <div className="relative flex flex-col gap-3 p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl} name={name} size="xl" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Typography variant="h1" className="truncate font-display font-bold">
                {name}
              </Typography>
              <Typography variant="muted" className="truncate">
                {email}
              </Typography>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Chip
              className={flatChipClassName}
              type={emailVerified ? "success" : "warning"}
              leftIcon={
                emailVerified ? (
                  <BadgeCheck className="size-3.5" />
                ) : (
                  <CircleAlert className="size-3.5" />
                )
              }
              label={emailVerified ? "Email verified" : "Email unverified"}
            />
            <Chip
              className={flatChipClassName}
              type={whatsappVerified ? "success" : "error"}
              leftIcon={
                whatsappVerified ? (
                  <BadgeCheck className="size-3.5" />
                ) : (
                  <CircleAlert className="size-3.5" />
                )
              }
              label={whatsappVerified ? "WhatsApp verified" : "WhatsApp unverified"}
            />
            {memberSinceLabel && (
              <Chip
                className={flatChipClassName}
                leftIcon={<CalendarDays className="size-3.5" />}
                label={`Member since ${memberSinceLabel}`}
              />
            )}
          </div>
        </div>
      </div>

      {!whatsappVerified && (
        <Banner
          variant="warning"
          icon={<AlertTriangle />}
          title="Verify your WhatsApp number to submit groups"
          description={`${whatsappNumber ? `${whatsappNumber} hasn't` : "Your number hasn't"} been confirmed yet. Until it's verified your account isn't fully verified, and group submission stays locked.`}
        >
          {onVerifyWhatsapp && (
            <Button
              size="sm"
              className="self-center"
              leftIcon={<ArrowRight />}
              onClick={onVerifyWhatsapp}
            >
              Verify WhatsApp number
            </Button>
          )}
        </Banner>
      )}
    </div>
  );
}
