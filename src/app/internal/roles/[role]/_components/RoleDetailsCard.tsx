"use client";

import { Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";

interface RoleDetailsCardProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function RoleDetailsCard({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: RoleDetailsCardProps) {
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
              onChange={(event) => onNameChange(event.target.value)}
              leftIcon={<LinkIcon />}
            />
          </Field>
          <Field>
            <FieldLabel required>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
