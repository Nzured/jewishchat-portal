"use client";

import { Suspense, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import AuthIllustration from "@/components/layout/auth/AuthIllustration";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { PASSWORD_REQUIREMENTS } from "@/configs/const";
import { AuthService } from "@/services/auth/auth.service";
import type { InvitedUser } from "@/services/auth/auth.types";

type Step = "invitation" | "set-password" | "invalid" | "success";

interface SetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-surface-line bg-surface-bg p-3.5 text-xs leading-relaxed text-ink-3">
      {children}
    </div>
  );
}

function Eyebrow() {
  return (
    <Typography
      variant="p"
      className="text-xs font-semibold tracking-widest text-brand-green uppercase"
    >
      Admin Invitation
    </Typography>
  );
}

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [step, setStep] = useState<Step>("invitation");
  const [isValidating, setIsValidating] = useState(false);
  const [invitedUser, setInvitedUser] = useState<InvitedUser | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({ control, name: "newPassword" }) ?? "";

  const onContinue = async () => {
    if (!token) {
      setStep("invalid");
      return;
    }

    setIsValidating(true);
    try {
      const res = await AuthService.validateToken(token);
      setInvitedUser(res?.data ?? null);
      setStep("set-password");
    } catch (error) {
      console.error(error);
      setStep("invalid");
    } finally {
      setIsValidating(false);
    }
  };

  const onSetPassword = async (values: SetPasswordFormValues) => {
    if (!token) {
      setStep("invalid");
      return;
    }

    try {
      const res = await AuthService.acceptAccount({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setInvitedUser(res?.data ?? invitedUser);
      setStep("success");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col-reverse justify-end lg:grid lg:justify-normal min-h-screen lg:h-screen w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden lg:grid-cols-2">
      <div className="flex h-full flex-col items-center justify-center px-6 py-8 lg:py-0 overflow-x-hidden [view-transition-name:auth-form]">
        <div className="w-full max-w-[420px]">
          {step === "invitation" && (
            <>
              <div className="mb-8 flex flex-col gap-2">
                <Eyebrow />
                <Typography variant="h2" className="font-semibold text-ink-1 leading-[1.2]">
                  You have been invited to JewishChat
                </Typography>
                <Typography variant="p" className="text-sm text-ink-3">
                  An administrator has created an account for you on the JewishChat admin console.
                  Continue to set your password and finish activating it.
                </Typography>
              </div>

              <div className="flex flex-col gap-5">
                <InfoBox>
                  Two things to know: this invitation can only be used once, and it stops working 48
                  hours after it was sent.
                </InfoBox>

                <Button
                  type="button"
                  variant="default"
                  className="w-full text-base mt-2 h-[46px]"
                  disabled={isValidating}
                  onClick={() => void onContinue()}
                >
                  Continue
                </Button>

                <div className="flex flex-row items-center justify-center gap-2 text-[13px] text-ink-3">
                  <span>Already activated?</span>
                  <Link href="/login">Login</Link>
                </div>
              </div>
            </>
          )}

          {step === "set-password" && (
            <>
              <div className="mb-8 flex flex-col gap-2">
                <Eyebrow />
                <Typography variant="h2" className="font-semibold text-ink-1 leading-[1.2]">
                  Set your password
                </Typography>
                <Typography variant="p" className="text-sm text-ink-3">
                  You have been invited to the JewishChat admin console. Choose a password to
                  activate your account.
                </Typography>
              </div>

              <form onSubmit={(e) => void handleSubmit(onSetPassword)(e)} noValidate>
                <FieldGroup className="gap-5">
                  <Field>
                    <FieldLabel required htmlFor="password">
                      New Password
                    </FieldLabel>
                    <Input
                      type="password"
                      id="newPassword"
                      placeholder="Create a password"
                      error={errors.newPassword?.message}
                      {...register("newPassword", {
                        required: "Password is required",
                        validate: (value) =>
                          PASSWORD_REQUIREMENTS.every((req) => req.regex.test(value)) ||
                          "Password does not meet all requirements",
                      })}
                    />
                    <div className="flex flex-col gap-1.5 text-[12px] text-ink-3">
                      {PASSWORD_REQUIREMENTS.map((req) => {
                        const isMet = req.regex.test(passwordValue);
                        return (
                          <div key={req.id} className="flex items-center gap-1.5">
                            {isMet ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                            ) : (
                              <div className="h-3 w-3 shrink-0 rounded-full border border-surface-line-strong" />
                            )}
                            <span className={isMet ? "text-ink-1" : ""}>{req.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel required htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      type="password"
                      id="confirmPassword"
                      placeholder="Create a password"
                      error={errors.confirmPassword?.message}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value, formValues) =>
                          value === formValues.newPassword || "Passwords do not match",
                      })}
                    />
                  </Field>

                  <Button
                    type="submit"
                    variant="default"
                    className="w-full text-base mt-2 h-[46px]"
                    disabled={isSubmitting}
                  >
                    Activate account
                  </Button>

                  <div className="flex flex-row items-center justify-center gap-2 text-[13px] text-ink-3">
                    <span>Back to</span>
                    <Link href="/login">Login</Link>
                  </div>
                </FieldGroup>
              </form>
            </>
          )}

          {step === "invalid" && (
            <>
              <div className="mb-8 flex flex-col gap-2">
                <Eyebrow />
                <Typography variant="h2" className="font-semibold text-ink-1 leading-[1.2]">
                  This link is not valid
                </Typography>
                <Typography variant="p" className="text-sm text-ink-3">
                  The invitation may have been withdrawn, or the link may have been broken when it
                  was copied out of the email.
                </Typography>
              </div>

              <div className="flex flex-col gap-5">
                <InfoBox>
                  Open the link straight from the invitation email rather than pasting it. If it
                  still fails, ask your administrator to send a new invitation.
                </InfoBox>

                <Button
                  type="button"
                  variant="default"
                  className="w-full text-base mt-2 h-[46px]"
                  onClick={() => router.push("/login")}
                >
                  Go to Sign in
                </Button>
              </div>
            </>
          )}

          {step === "success" && (
            <>
              <div className="mb-8 flex flex-col gap-2">
                <Eyebrow />
                <Typography variant="h2" className="font-semibold text-ink-1 leading-[1.2]">
                  You are all set{invitedUser?.firstName ? `, ${invitedUser.firstName}` : ""}
                </Typography>
                <Typography variant="p" className="text-sm text-ink-3">
                  Your password is saved and you are signed in. We are taking you to the admin
                  dashboard now.
                </Typography>
              </div>

              <div className="flex flex-col gap-5">
                <InfoBox>
                  <span className="font-semibold text-ink-2">Heads up:</span> this invitation link
                  is now used up. From here on, sign in from the admin login page with your email
                  and password.
                </InfoBox>

                <Button
                  type="button"
                  variant="default"
                  className="w-full text-base mt-2 h-[46px]"
                  onClick={() => router.push("/internal")}
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <AuthIllustration />
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteContent />
    </Suspense>
  );
}
