"use client";

import { Suspense } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import AuthIllustration from "@/components/layout/auth/AuthIllustration";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { PASSWORD_REQUIREMENTS } from "@/configs/const";
import { AuthService } from "@/services/auth/auth.service";

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({ control, name: "password" }) ?? "";

  const onValid = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }

    try {
      await AuthService.resetPassword({ token, newPassword: values.password });
      toast.success("Your password has been changed. Please log in.");
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col-reverse justify-end lg:grid lg:justify-normal min-h-screen lg:h-screen w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden lg:grid-cols-2">
      <div className="flex h-full flex-col items-center justify-center px-6 py-8 lg:py-0 overflow-x-hidden [view-transition-name:auth-form]">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col gap-2">
            <Typography
              variant="p"
              className="text-xs font-semibold tracking-widest text-brand-green uppercase"
            >
              Reset Password
            </Typography>
            <Typography variant="h2" className="font-semibold text-ink-1 leading-[1.2]">
              Set up new password
            </Typography>
            <Typography variant="p" className="text-sm text-ink-3">
              Enter a new password that will replace the current one.
            </Typography>
          </div>

          <form onSubmit={(e) => void handleSubmit(onValid)(e)} noValidate>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel required htmlFor="password">
                  New Password
                </FieldLabel>
                <Input
                  type="password"
                  id="password"
                  placeholder="Create a password"
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    validate: (value) =>
                      PASSWORD_REQUIREMENTS.every((req) => req.regex.test(value)) ||
                      "Password does not meet all requirements",
                  })}
                />
                <div className="grid grid-flow-col grid-rows-3 gap-x-6 gap-y-1.5 text-[12px] text-ink-3">
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
                      value === formValues.password || "Passwords do not match",
                  })}
                />
              </Field>

              <Button
                type="submit"
                variant="default"
                className="w-full text-base mt-2 h-[46px]"
                disabled={isSubmitting}
              >
                Change Password <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex flex-row items-center justify-center gap-2 text-[13px] text-ink-3">
                <span>Back to</span>
                <Link href="/login">Login</Link>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
      <AuthIllustration />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
