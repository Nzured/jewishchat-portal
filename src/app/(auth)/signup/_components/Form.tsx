"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TransitionLink } from "@/components/layout/auth/TransitionLink";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";
import { PASSWORD_REQUIREMENTS, EMAIL_REGEX } from "@/configs/const";

interface FormProps {
  onSuccess?: (data: Record<string, string>) => void;
}

export default function Form({ onSuccess }: FormProps) {
  const [passwordValue, setPasswordValue] = useState("");
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
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const pass = formData.get("password") as string;

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";

    if (!pass) {
      newErrors.password = "Password is required";
    } else {
      const isPasswordValid = PASSWORD_REQUIREMENTS.every((req) => req.regex.test(pass));
      if (!isPasswordValid) {
        newErrors.password = "Password does not meet all requirements";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const payload = Object.fromEntries(formData) as Record<string, string>;
      console.log("Form is valid! Payload:", payload);
      alert("Form valid! See console for payload.");
      if (onSuccess) {
        onSuccess(payload);
      }
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-2">
        <Typography
          variant="p"
          className="text-xs font-semibold tracking-widest text-brand-green uppercase"
        >
          Create your account
        </Typography>
        <Typography variant="h2" className="font-semibold text-ink-1 leading-tight">
          Let&apos;s get you set up
        </Typography>
        <Typography variant="p" className="text-sm text-ink-3">
          Takes a minute. You&apos;ll verify your email next.
        </Typography>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup className="gap-3">
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <Field className="flex-1">
              <FieldLabel required htmlFor="firstName">
                First name
              </FieldLabel>
              <Input
                name="firstName"
                id="firstName"
                placeholder="Rivka"
                error={errors.firstName}
                onChange={() => clearError("firstName")}
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel required htmlFor="lastName">
                Last name
              </FieldLabel>
              <Input
                name="lastName"
                id="lastName"
                placeholder="Cohen"
                error={errors.lastName}
                onChange={() => clearError("lastName")}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="mobileNumber">Mobile Number</FieldLabel>
            <Input
              name="mobileNumber"
              type="tel"
              id="mobileNumber"
              placeholder="Enter your phone number"
              error={errors.mobileNumber}
              onChange={() => clearError("mobileNumber")}
            />
          </Field>

          <Field>
            <FieldLabel required htmlFor="password">
              Password
            </FieldLabel>
            <Input
              name="password"
              type="password"
              id="password"
              placeholder="Create a password"
              value={passwordValue}
              error={errors.password}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                clearError("password");
              }}
            />
            <div className=" grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px] text-ink-3">
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

          <Button type="submit" variant="default" className="w-full text-base mt-4">
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="flex flex-row items-center justify-center gap-1 text-sm text-ink-3">
            <span>Already have an account?</span>
            <TransitionLink
              href="/login"
              direction="signup-to-login"
              className="font-medium text-brand-green underline underline-offset-4 hover:text-brand-deep"
            >
              Log in
            </TransitionLink>
          </div>
        </FieldGroup>
      </form>
    </>
  );
}
