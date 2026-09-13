"use client";

import * as React from "react";
import { Check } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { OtpInput } from "@/components/ui/OtpInput";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_NEW_PATH, RESEND_OTP_COOLDOWN_SECONDS } from "@/configs/const";
import { UserService } from "@/services/user/user.service";

const OTP_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 10;

function formatCooldown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface VerifyWhatsappModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mobile?: string;
  onVerified: () => void | Promise<void>;
}

export function VerifyWhatsappModal({
  open,
  onOpenChange,
  mobile,
  onVerified,
}: VerifyWhatsappModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open && (
        <VerifyWhatsappModalBody
          mobile={mobile}
          onOpenChange={onOpenChange}
          onVerified={onVerified}
        />
      )}
    </Modal>
  );
}

function VerifyWhatsappModalBody({
  mobile,
  onOpenChange,
  onVerified,
}: Omit<VerifyWhatsappModalProps, "open">) {
  const [step, setStep] = React.useState<"code" | "verified">("code");
  const [otp, setOtp] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(RESEND_OTP_COOLDOWN_SECONDS);

  React.useEffect(() => {
    if (step !== "code" || resendCooldown <= 0) return;
    const timeout = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendCooldown, step]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setHasError(true);
      return;
    }

    setIsVerifying(true);
    try {
      await UserService.confirmWhatsappVerification(otp);
      await onVerified();
      setStep("verified");
    } catch {
      setHasError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(RESEND_OTP_COOLDOWN_SECONDS);
    setOtp("");
    setHasError(false);
    void UserService.requestWhatsappVerification();
  };

  if (step === "verified") {
    return (
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Mobile number verified</ModalTitle>
        </ModalHeader>

        <div
          key="verified"
          className="flex flex-col items-center gap-3 px-5 py-6 text-center animate-in fade-in zoom-in-95 duration-300"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-state-bg-success text-brand-green animate-in zoom-in-50 duration-500">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
          <Typography variant="h3" className="font-display font-bold text-ink-1">
            You can list groups now
          </Typography>
          <Typography variant="small" className="max-w-xs text-ink-3">
            Your account is fully verified, so group submission is unlocked.
          </Typography>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
          <Button asChild color="primary">
            <NextLink href={EXTERNAL_GROUPS_NEW_PATH}>Add a group</NextLink>
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  }

  return (
    <ModalContent className="max-w-md">
      <ModalHeader>
        <ModalTitle>Enter your code</ModalTitle>
        <ModalDescription>
          We sent a {OTP_LENGTH} digit code by WhatsApp
          {mobile ? (
            <>
              {" "}
              to <span className="font-medium text-ink-1">{mobile}</span>
            </>
          ) : null}
          .
        </ModalDescription>
      </ModalHeader>

      <div className="flex flex-col items-center gap-3 px-5 py-4">
        <OtpInput
          length={OTP_LENGTH}
          value={otp}
          onChange={(value) => {
            setOtp(value);
            setHasError(false);
          }}
          disabled={isVerifying}
          isVerifying={isVerifying}
          hasError={hasError}
          className="justify-center"
        />

        {hasError && (
          <Typography variant="small" className="text-state-danger">
            Incorrect code. Please try again.
          </Typography>
        )}

        <Typography variant="xs" className="text-center text-ink-4">
          Code expires in {CODE_EXPIRY_MINUTES} minutes.{" "}
          {resendCooldown > 0 ? (
            <>Resend available in {formatCooldown(resendCooldown)}</>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="cursor-pointer font-medium text-brand-green underline underline-offset-4 hover:text-brand-deep"
            >
              Resend code
            </button>
          )}
        </Typography>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isVerifying}
          onClick={() => onOpenChange(false)}
        >
          Back
        </Button>
        <Button
          type="button"
          color="primary"
          disabled={isVerifying || otp.length !== OTP_LENGTH}
          onClick={() => void handleVerify()}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}
