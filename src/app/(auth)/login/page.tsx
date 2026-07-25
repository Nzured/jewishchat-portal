"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import AuthIllustration from "@/components/layout/auth/AuthIllustration";
import { TransitionLink } from "@/components/layout/auth/TransitionLink";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import {
  EMAIL_CHECK_DEBOUNCE_MS,
  EMAIL_REGEX,
  NAME_PART_ONE,
  NAME_PART_TWO,
} from "@/configs/const";
import { useAuth } from "@/contexts/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { LoginPayload } from "@/services/auth/auth.types";
import { UserType } from "@/types/User";
import { VerifyEmailModal } from "./_components/VerifyEmailModal";

export default function LoginPage() {
  const { resolveUserType, login } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<LoginPayload>();

  const email = watch("email");
  const debouncedEmail = useDebouncedValue(email, EMAIL_CHECK_DEBOUNCE_MS);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);

  useEffect(() => {
    if (!debouncedEmail || !EMAIL_REGEX.test(debouncedEmail)) {
      setUserType(null);
      return;
    }

    void (async () => {
      setIsCheckingEmail(true);
      try {
        setUserType(await resolveUserType(debouncedEmail));
      } catch {
        // resolveUserType already swallows its own errors; nothing to do here.
      } finally {
        setIsCheckingEmail(false);
      }
    })();
  }, [debouncedEmail, resolveUserType]);

  const isInternal = userType === UserType.INTERNAL;
  const forgotPasswordHref =
    email && EMAIL_REGEX.test(email)
      ? `/forgot-password?email=${encodeURIComponent(email)}`
      : "/forgot-password";

  const onSubmit = async (data: LoginPayload) => {
    try {
      if (!data || !data.email || !data.password) return;

      const userType = await resolveUserType(data.email);
      if (!userType) {
        setError("email", {
          type: "manual",
          message: "No account found with this email. Please sign up.",
        });
        return;
      }

      await login(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setPendingVerifyEmail(data.email);
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const message =
          (error.response?.data as { message?: string } | undefined)?.message ||
          "Invalid email or password.";
        setError("password", { type: "manual", message });
        return;
      }
      console.error(error);
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col-reverse justify-end overflow-hidden lg:grid lg:h-screen lg:grid-cols-2 lg:justify-normal">
      <div className="flex h-full flex-col items-center justify-center overflow-x-hidden px-6 py-2 lg:py-0 [view-transition-name:auth-form]">
        <div className="w-full max-w-[420px]">
          <div className="mb-2 flex flex-col gap-1 md:mb-4 md:gap-2">
            <Typography
              variant="p"
              className="text-xs font-semibold tracking-widest text-brand-green uppercase"
            >
              Log In
            </Typography>
            <Typography variant="h2" className="font-semibold text-ink-1 leading-[1.2]">
              Welcome back to {NAME_PART_ONE}
              <Typography as="span" className="font-serif italic font-normal text-brand-green">
                {NAME_PART_TWO.toLowerCase()}
              </Typography>
            </Typography>
            <Typography variant="p" className="text-sm text-ink-3">
              Sign in to add and manage your group listings.
            </Typography>
          </div>

          <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
            <FieldGroup className="gap-2 md:gap-5">
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

              <Field>
                <FieldLabel required htmlFor="password" className="mb-0">
                  Password
                </FieldLabel>
                <Input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register("password", { required: "Password is required" })}
                />
                <div className="flex w-full justify-end">
                  {isInternal ? (
                    <Typography
                      as="span"
                      className="text-[13px] font-medium text-ink-4 cursor-not-allowed"
                    >
                      Forgot Password?
                    </Typography>
                  ) : (
                    <Link href={forgotPasswordHref}>Forgot Password?</Link>
                  )}
                </div>
              </Field>

              <Button
                type="submit"
                variant="default"
                className="w-full text-base mt-0 md:mt-2 h-[46px]"
              >
                Log In <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex flex-row items-start justify-center gap-2 text-[13px] text-ink-3 mt-1 md:mt-4">
                <span>New to {NAME_PART_ONE + NAME_PART_TWO}?</span>
                <TransitionLink href="/signup" direction="login-to-signup">
                  Create Account
                </TransitionLink>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
      <AuthIllustration />

      <VerifyEmailModal
        email={pendingVerifyEmail}
        onOpenChange={(open) => {
          if (!open) setPendingVerifyEmail(null);
        }}
      />
    </div>
  );
}
