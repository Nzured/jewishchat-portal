"use client";

import * as React from "react";
import { Globe, Link, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { URL } from "@/configs/const";
import { Category } from "@/types/Category";
import { DEFAULT_ICON_NAMES } from "./categoryIcons";
import { IconPicker } from "./IconPicker";

const DEFAULT_ICON_NAME: string = DEFAULT_ICON_NAMES[0];

interface AddCategoryModalProps {
  onSubmit: (category: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
  }) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  category?: Category | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AddCategoryModal({ onSubmit, open, setOpen, category }: AddCategoryModalProps) {
  const isEditing = category != null;

  const [name, setName] = React.useState(category?.name ?? "");
  const [slug, setSlug] = React.useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = React.useState(category != null);
  const [description, setDescription] = React.useState(category?.description ?? "");
  const [iconName, setIconName] = React.useState(category?.icon ?? DEFAULT_ICON_NAME);

  // Reset/populate the form when the dialog transitions to open, following React's
  // guidance for adjusting state in response to prop changes: do it synchronously
  // during render (guarded against a tracked previous value) rather than in an effect.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(category?.name ?? "");
      setSlug(category?.slug ?? "");
      setSlugEdited(category != null);
      setDescription(category?.description ?? "");
      setIconName(category?.icon ?? DEFAULT_ICON_NAME);
    }
  }

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handleSubmit = () => {
    onSubmit({ id: category?.id, name, slug, description, icon: iconName });
    setOpen(false);
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalContent variant="primary" className="max-w-xl">
        <ModalHeader icon={isEditing ? <Pencil /> : <Plus />}>
          <ModalTitle>{isEditing ? "Edit Category" : "Create Category"}</ModalTitle>
          <ModalDescription>
            <Typography variant="p" className="text-ink-1">
              Categories give the community a way to browse groups by topic.
            </Typography>
          </ModalDescription>
        </ModalHeader>

        <FieldGroup className="gap-4 mt-2">
          <Field>
            <FieldLabel required>Category Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Category Name"
            />
          </Field>
          <Field>
            <FieldLabel required>Slug</FieldLabel>
            <Input
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="category-slug"
              leftIcon={<Link />}
            />
            <FieldDescription icon={<Globe />}>{URL + slug + "...."}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this category is for...."
            />
          </Field>
          <Field>
            <FieldLabel required>Category Icon</FieldLabel>
            <IconPicker value={iconName} onChange={setIconName} />
          </Field>
        </FieldGroup>

        <ModalFooter>
          <ModalClose asChild>
            <Button
              leftIcon={<X />}
              variant="secondary"
              color="primary"
              className="text-ink-2 hover:bg-surface-bg"
            >
              Cancel
            </Button>
          </ModalClose>
          <Button
            leftIcon={isEditing ? <Pencil /> : <Plus />}
            onClick={handleSubmit}
            disabled={!name || !slug}
            variant="default"
            color="primary"
          >
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
