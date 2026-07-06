"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthIllustration from "@/components/layout/auth/AuthIllustration";
import { TransitionLink } from "@/components/layout/auth/TransitionLink";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { EMAIL_REGEX } from "@/configs/const";
import { getHomePathForUserType, setAuthSession } from "@/lib/auth";
import { UserType } from "@/types/User";

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const email = formData.get("email") as string;
    const pass = formData.get("password") as string;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!pass) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const payload = Object.fromEntries(formData) as Record<string, string>;
      console.log("Login Form is valid! Payload:", payload);

      // TODO: replace with the real login API response
      const accessToken = "mock-access-token";
      const userType = UserType.EXTERNAL;

      setAuthSession(accessToken, userType);
      toast.success("User has successfully logged in");
      router.push(getHomePathForUserType(userType));
    }
  };

  return (
    <div className="flex flex-col-reverse lg:grid min-h-screen lg:h-screen w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden lg:grid-cols-2">
      <div className="flex h-full flex-col items-center justify-center px-6 py-8 lg:py-0 overflow-x-hidden [view-transition-name:auth-form]">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col gap-2">
            <Typography
              variant="p"
              className="text-xs font-semibold tracking-widest text-brand-green uppercase"
            >
              Log In
            </Typography>
            <Typography variant="h2" className="font-semibold text-ink-1 leading-[1.2]">
              Welcome back to Jewish
              <Typography as="span" className="font-serif italic font-normal text-brand-green">
                chat
              </Typography>
            </Typography>
            <Typography variant="p" className="text-sm text-ink-3">
              Sign in to add and manage your group listings.
            </Typography>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel required htmlFor="email">
                  Email address
                </FieldLabel>
                <Input
                  name="email"
                  type="email"
                  id="email"
                  placeholder="you@email.com"
                  error={errors.email}
                  onChange={() => clearError("email")}
                />
              </Field>

              <Field>
                <FieldLabel required htmlFor="password" className="mb-0">
                  Password
                </FieldLabel>
                <Input
                  name="password"
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  error={errors.password}
                  onChange={() => clearError("password")}
                />
                <div className="flex w-full justify-end">
                  <Link href="#">Forgot Password?</Link>
                </div>
              </Field>

              <Button type="submit" variant="default" className="w-full text-base mt-2 h-[46px]">
                Log In <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex flex-row items-start justify-center gap-2 text-[13px] text-ink-3 mt-4">
                <span>New to JewishChat?</span>
                <TransitionLink
                  href="/signup"
                  direction="login-to-signup"
                  className="font-medium text-brand-green underline underline-offset-4 hover:text-brand-deep"
                >
                  Create Account
                </TransitionLink>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
      <AuthIllustration />
    </div>
  );
}
