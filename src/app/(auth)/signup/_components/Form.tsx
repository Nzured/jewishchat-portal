"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { TransitionLink } from "@/components/layout/auth/TransitionLink";
import { Button } from "@/components/ui/Button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Typography } from "@/components/ui/Typography";
import {
  COUNTRY_CODES,
  EMAIL_CHECK_DEBOUNCE_MS,
  EMAIL_EXISTS_MESSAGE,
  EMAIL_REGEX,
  PASSWORD_REQUIREMENTS,
} from "@/configs/const";
import { useAuth } from "@/contexts/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AuthService } from "@/services/auth/auth.service";
import type { SignupRequest } from "@/services/auth/auth.types";
import { emailRules, firstNameRules, lastNameRules, passwordRules } from "./validation";

interface SignupFormValues extends Omit<SignupRequest, "mobile"> {
  countryCode: string;
  mobile: string;
}

interface FormProps {
  onSuccess?: (email: string) => void;
}

export default function Form({ onSuccess }: FormProps) {
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      countryCode: COUNTRY_CODES[0].value,
      mobile: "",
      password: "",
    },
  });

  const passwordValue = useWatch({ control, name: "password" });
  const emailValue = useWatch({ control, name: "email" });
  const debouncedEmail = useDebouncedValue(emailValue, EMAIL_CHECK_DEBOUNCE_MS);
  const emailExistsCacheRef = useRef<{ email: string; exists: boolean } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (emailExistsCacheRef.current?.email === email) return emailExistsCacheRef.current.exists;

    const res = await AuthService.getUserType({ email }).catch(() => null);
    const exists = Boolean(res?.data?.userType);
    emailExistsCacheRef.current = { email, exists };
    return exists;
  };

  useEffect(() => {
    if (!debouncedEmail || !EMAIL_REGEX.test(debouncedEmail)) return;

    void (async () => {
      setIsCheckingEmail(true);
      try {
        const exists = await checkEmailExists(debouncedEmail);
        if (exists) {
          setError("email", { type: "manual", message: EMAIL_EXISTS_MESSAGE });
        } else {
          clearErrors("email");
        }
      } catch {
        // checkEmailExists already swallows its own errors; nothing to do here.
      } finally {
        setIsCheckingEmail(false);
      }
    })();
  }, [debouncedEmail]);

  const countryCode = useWatch({ control, name: "countryCode" });

  const onValid = async (values: SignupFormValues) => {
    try {
      const exists = await checkEmailExists(values.email);
      if (exists) {
        setError("email", { type: "manual", message: EMAIL_EXISTS_MESSAGE });
        return;
      }

      const { countryCode, mobile, ...rest } = values;
      await signup({ ...rest, mobile: mobile ? `${countryCode}${mobile}` : mobile });
      onSuccess?.(values.email);
    } catch (error) {
      console.error(error);
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
      <form onSubmit={(e) => void handleSubmit(onValid)(e)} noValidate>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel required htmlFor="email">
              Email address
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              error={errors.email?.message}
              loading={isCheckingEmail}
              {...register("email", emailRules)}
            />
          </Field>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Field className="flex-1">
              <FieldLabel required htmlFor="firstName">
                First name
              </FieldLabel>
              <Input
                id="firstName"
                placeholder="Rivka"
                error={errors.firstName?.message}
                {...register("firstName", firstNameRules)}
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel required htmlFor="lastName">
                Last name
              </FieldLabel>
              <Input
                id="lastName"
                placeholder="Cohen"
                error={errors.lastName?.message}
                {...register("lastName", lastNameRules)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="mobile">Mobile Number</FieldLabel>
            <div className="flex gap-2">
              <SelectDropdown
                items={COUNTRY_CODES}
                value={countryCode}
                onValueChange={(value) => setValue("countryCode", value)}
                className="w-24 shrink-0"
              />
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your phone number"
                error={errors.mobile?.message}
                className="flex-1"
                {...register("mobile")}
              />
            </div>
          </Field>

          <Field>
            <FieldLabel required htmlFor="password">
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              error={errors.password?.message}
              {...register("password", passwordRules)}
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

          <Button
            type="submit"
            variant="default"
            className="w-full text-base mt-4"
            disabled={isSubmitting}
          >
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
