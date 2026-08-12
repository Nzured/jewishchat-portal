import { isValidPhone } from "@/components/ui/PhoneInput";
import { EMAIL_REGEX, PASSWORD_REQUIREMENTS } from "@/configs/const";
import { SignupRequest } from "@/services/auth/auth.types";
import type { RegisterOptions } from "react-hook-form";

export const emailRules: RegisterOptions<SignupRequest, "email"> = {
  required: "Email is required",
  pattern: {
    value: EMAIL_REGEX,
    message: "Invalid email format",
  },
};

export const firstNameRules: RegisterOptions<SignupRequest, "firstName"> = {
  required: "First name is required",
};

export const lastNameRules: RegisterOptions<SignupRequest, "lastName"> = {
  required: "Last name is required",
};

export const mobileRules = {
  validate: (value: string) =>
    !value || isValidPhone(value) || "Enter a valid phone number for the selected country",
};

export const passwordRules: RegisterOptions<SignupRequest, "password"> = {
  required: "Password is required",
  validate: (value) =>
    PASSWORD_REQUIREMENTS.every((req) => req.regex.test(value)) ||
    "Password does not meet all requirements",
};
