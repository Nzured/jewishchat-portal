"use client";

import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SwitchBanner } from "@/components/ui/SwitchBanner";
import { Textarea } from "@/components/ui/Textarea";
import { normalizeWhatsappGroupLink, validateWhatsappGroupLink } from "@/lib/whatsapp";
import type { CreateGroupFormValues } from "@/types/Group";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";

interface GroupDetailsFormProps {
  register: UseFormRegister<CreateGroupFormValues>;
  control: Control<CreateGroupFormValues>;
  errors: FieldErrors<CreateGroupFormValues>;
}

export default function GroupDetailsForm({ register, control, errors }: GroupDetailsFormProps) {
  return (
    <FieldGroup className="gap-4">
      <Field data-invalid={!!errors.whatsappLink}>
        <FieldLabel required htmlFor="whatsappLink">
          WhatsApp group link
        </FieldLabel>
        <Input
          type="url"
          id="whatsappLink"
          placeholder="https://chat.whatsapp.com/"
          {...register("whatsappLink", {
            required: "Whatsapp link is required",
            // Store the canonical link so pasted query params / missing scheme never reach the API.
            setValueAs: (value: string) => normalizeWhatsappGroupLink(value) ?? value.trim(),
            validate: validateWhatsappGroupLink,
          })}
        />
        <FieldError errors={[errors.whatsappLink]} />
      </Field>
      <Field data-invalid={!!errors.name}>
        <FieldLabel required htmlFor="name">
          Group Name
        </FieldLabel>
        <Input
          type="text"
          id="name"
          placeholder="Group Name"
          {...register("name", {
            required: "Group name is required",
          })}
        />
        <FieldError errors={[errors.name]} />
      </Field>
      <Field data-invalid={!!errors.shortDesc}>
        <FieldLabel required htmlFor="shortDesc">
          Description
        </FieldLabel>
        <Input
          type="text"
          id="shortDesc"
          maxLength={100}
          placeholder="Short description about your group"
          {...register("shortDesc", {
            required: "Short description is required",
          })}
        />
        <FieldError errors={[errors.shortDesc]} />
      </Field>
      <Field data-invalid={!!errors.about}>
        <FieldLabel htmlFor="about">About the group</FieldLabel>
        <Textarea
          maxLength={200}
          id="about"
          placeholder="Tell users what is your group about"
          aria-invalid={errors.about ? "true" : undefined}
          {...register("about")}
        />
        <FieldError errors={[errors.about]} />
      </Field>
      <Controller
        control={control}
        name="linkVisibilityLoggedInOnly"
        render={({ field }) => (
          <SwitchBanner
            label="Who can see the join link"
            title="Logged in members only"
            description="Off by default. Your listing stays public and searchable either way. This only controls the join link itself."
            checked={field.value}
            onCheckedChange={field.onChange}
            name={field.name}
          />
        )}
      />
    </FieldGroup>
  );
}
