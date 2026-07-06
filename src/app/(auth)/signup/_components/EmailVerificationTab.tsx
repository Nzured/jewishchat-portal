"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "@/components/ui/Link";
import { OtpInput } from "@/components/ui/OtpInput";
import { Typography } from "@/components/ui/Typography";

interface EmailVerificationTabProps {
  email?: string;
  onChangeEmailClick?: () => void;
  onVerified?: () => void;
}

export default function EmailVerificationTab({
  email,
  onChangeEmailClick,
  onVerified,
}: EmailVerificationTabProps) {
  const [otp, setOtp] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleOtpChange = (val: string) => {
    setOtp(val);
    setHasError(false);

    if (val.length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        if (val === "123456") {
          setIsVerified(true);
          setTimeout(() => {
            if (onVerified) onVerified();
          }, 500);
        } else {
          setHasError(true);
        }
      }, 1500);
    }
  };

  const handleResend = () => {
    setOtp("");
    setHasError(false);
    setIsVerified(false);
    alert("Verification code resent!");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Typography
          variant="p"
          className="text-xs font-semibold tracking-widest text-brand-green uppercase"
        >
          Verify your email
        </Typography>
        <Typography variant="h2" className="font-semibold text-ink-1 leading-tight">
          Check your Inbox
        </Typography>
        <Typography variant="p" className="text-sm text-ink-3">
          We sent a 6-digit code to <span className="font-semibold text-ink-1">{email}</span>{" "}
          <Link
            href={""}
            type="button"
            onClick={onChangeEmailClick}
            className="font-medium text-brand-green  hover:text-brand-deep cursor-pointer"
          >
            Change
          </Link>
        </Typography>
      </div>
      <div className="my-2">
        <OtpInput
          length={6}
          value={otp}
          onChange={handleOtpChange}
          disabled={isVerifying}
          isVerifying={isVerifying}
          isVerified={isVerified}
          hasError={hasError}
        />
      </div>
      {(isVerifying || isVerified || hasError) && (
        <div className="flex items-center min-h-6">
          {isVerifying ? (
            <div className="flex items-center gap-2 text-brand-green text-sm font-semibold">
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : isVerified ? (
            <div className="text-brand-green text-sm font-semibold">Verified!</div>
          ) : (
            <div className="text-state-error text-sm font-semibold">
              Incorrect code. Please try again.
            </div>
          )}
        </div>
      )}

      {/* Footer / Resend details */}
      <div className="flex flex-col gap-2.5 mt-2">
        <Typography variant="p" className="text-sm text-ink-3">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-brand-green underline underline-offset-4 hover:text-brand-deep cursor-pointer"
          >
            Resend
          </button>
        </Typography>
        <Typography variant="p" className="text-sm text-ink-4">
          Check your spam &amp; trash folders if it&apos;s not there.
        </Typography>
      </div>
    </div>
  );
}
