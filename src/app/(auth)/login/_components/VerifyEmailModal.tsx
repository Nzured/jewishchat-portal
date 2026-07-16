"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { OtpInput } from "@/components/ui/OtpInput";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { getHomePathForUserType } from "@/lib/auth";

interface VerifyEmailModalProps {
  email: string | null;
  onOpenChange: (open: boolean) => void;
}

export function VerifyEmailModal({ email, onOpenChange }: VerifyEmailModalProps) {
  return (
    <Modal open={Boolean(email)} onOpenChange={onOpenChange}>
      {email && <VerifyEmailModalBody key={email} email={email} onOpenChange={onOpenChange} />}
    </Modal>
  );
}

const RESEND_COOLDOWN_SECONDS = 120;

function formatCooldown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface VerifyEmailModalBodyProps {
  email: string;
  onOpenChange: (open: boolean) => void;
}

function VerifyEmailModalBody({ email, onOpenChange }: VerifyEmailModalBodyProps) {
  const router = useRouter();
  const { verifyEmail, resendOtp } = useAuth();
  const [otp, setOtp] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(RESEND_COOLDOWN_SECONDS);

  React.useEffect(() => {
    if (resendCooldown === 0) return;

    const timeout = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendCooldown]);

  const handleVerify = async (code: string) => {
    setIsVerifying(true);
    try {
      const userType = await verifyEmail({ email, otp: code });
      if (!userType) {
        setHasError(true);
        return;
      }

      toast.success("Email verified. You're now logged in.");
      onOpenChange(false);
      router.push(getHomePathForUserType(userType));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setHasError(false);

    if (value.length === 6) {
      void handleVerify(value);
    }
  };

  const handleResend = () => {
    void resendOtp(email);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <ModalContent variant="primary">
      <ModalHeader icon={<ShieldCheck />}>
        <ModalTitle>Verify your email</ModalTitle>
        <ModalDescription>
          Enter the 6-digit code we sent to <span className="font-medium text-ink-1">{email}</span>{" "}
          to finish logging in.
        </ModalDescription>
      </ModalHeader>

      <div className="flex flex-col gap-4">
        <OtpInput
          length={6}
          value={otp}
          onChange={handleOtpChange}
          disabled={isVerifying}
          isVerifying={isVerifying}
          hasError={hasError}
        />

        {hasError && (
          <Typography variant="small" className="text-state-danger">
            Incorrect code. Please try again.
          </Typography>
        )}

        <Typography variant="small" className="text-ink-3">
          Didn&apos;t get a code?{" "}
          {resendCooldown > 0 ? (
            <span className="font-medium text-ink-4">
              Resend in {formatCooldown(resendCooldown)}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-brand-green underline underline-offset-4 hover:text-brand-deep cursor-pointer"
            >
              Resend
            </button>
          )}
        </Typography>
      </div>
    </ModalContent>
  );
}
