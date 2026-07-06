"use client";

import * as React from "react";
import { Globe, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { URL } from "@/configs/const";
import { Role } from "@/types/Role";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface RoleDetailsCardProps {
  role: Role;
}

export function RoleDetailsCard({ role }: RoleDetailsCardProps) {
  const [name, setName] = React.useState(role.role);
  const [description, setDescription] = React.useState(role.description);

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <Typography variant="xs" className="font-semibold tracking-wide text-ink-3 uppercase">
          Role details
        </Typography>

        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel required>Role Name</FieldLabel>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              leftIcon={<LinkIcon />}
            />
            <FieldDescription icon={<Globe />}>{`${URL}${slugify(name)}....`}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel required>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
