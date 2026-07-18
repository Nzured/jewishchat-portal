"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import AuthIllustration from "@/components/layout/auth/AuthIllustration";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { EMAIL_REGEX } from "@/configs/const";
import { useAuth } from "@/contexts/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AuthService } from "@/services/auth/auth.service";

const EMAIL_EXISTS_DEBOUNCE_MS = 400;
const NO_ACCOUNT_MESSAGE = "No account found with this email.";

interface ForgotPasswordPayload {
  email: string;
}

export default function ForgotPasswordPage() {
  const { resolveUserType } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordPayload>();

  const email = watch("email");
  const debouncedEmail = useDebouncedValue(email, EMAIL_EXISTS_DEBOUNCE_MS);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    if (!debouncedEmail || !EMAIL_REGEX.test(debouncedEmail)) return;

    void (async () => {
      setIsCheckingEmail(true);
      try {
        const userType = await resolveUserType(debouncedEmail);
        if (!userType) {
          setError("email", { type: "manual", message: NO_ACCOUNT_MESSAGE });
        } else {
          clearErrors("email");
        }
      } catch {
        // resolveUserType already swallows its own errors; nothing to do here.
      } finally {
        setIsCheckingEmail(false);
      }
    })();
  }, [debouncedEmail, resolveUserType, setError, clearErrors]);

  const onValid = async (data: ForgotPasswordPayload) => {
    try {
      const userType = await resolveUserType(data.email);
      if (!userType) {
        setError("email", { type: "manual", message: NO_ACCOUNT_MESSAGE });
        return;
      }

      const res = await AuthService.forgotPassword(data);

      if (res && res.message) {
        toast.success(`A reset link has been sent to ${data.email}`);
      }
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
              Forgot your password?
            </Typography>
            <Typography variant="p" className="text-sm text-ink-3">
              Enter your email address and we&apos;ll send you a reset link.
            </Typography>
          </div>

          <form onSubmit={(e) => void handleSubmit(onValid)(e)} noValidate>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel required htmlFor="email">
                  Email address
                </FieldLabel>
                <Input
                  type="email"
                  id="email"
                  placeholder="you@email.com"
                  error={errors.email?.message}
                  loading={isCheckingEmail}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: EMAIL_REGEX, message: "Invalid email format" },
                  })}
                />
              </Field>

              <Button
                type="submit"
                variant="default"
                className="w-full text-base mt-2 h-[46px]"
                disabled={isSubmitting}
              >
                Send Reset Link <ArrowRight className="ml-2 h-5 w-5" />
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
