"use client";

import * as React from "react";
import { Globe, Link, Pencil, Plus, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field";
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
import { useCategories } from "../_context/CategoryContext";
import { IconPicker } from "./IconPicker";

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface AddCategoryModalProps {
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

function defaultValuesFor(category?: Category | null): CategoryFormValues {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
  };
}

export function AddCategoryModal({ open, setOpen, category }: AddCategoryModalProps) {
  const isEditing = category != null;
  const [slugEdited, setSlugEdited] = React.useState(isEditing);
  const { createCategory, updateCategory } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: defaultValuesFor(category),
    mode: "onChange",
  });

  const slug = useWatch({ control, name: "slug" });

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSlugEdited(isEditing);
      reset(defaultValuesFor(category));
    }
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset(defaultValuesFor(null));
  };

  const onValid = async (values: CategoryFormValues) => {
    try {
      if (isEditing) {
        await updateCategory(category.id, values);
      } else {
        await createCategory(values);
      }
      handleOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent variant="primary" className="max-w-xl">
        <ModalHeader icon={isEditing ? <Pencil /> : <Plus />}>
          <ModalTitle>{isEditing ? "Edit Category" : "Create Category"}</ModalTitle>
          <ModalDescription>
            <Typography variant="p" className="text-ink-1">
              Categories give the community a way to browse groups by topic.
            </Typography>
          </ModalDescription>
        </ModalHeader>

        <form id="add-category-form" onSubmit={(e) => void handleSubmit(onValid)(e)}>
          <FieldGroup className="gap-4 mt-2">
            <Field data-invalid={!!errors.name}>
              <FieldLabel required>Category Name</FieldLabel>
              <Input
                placeholder="Category Name"
                {...register("name", {
                  required: "Category name is required",
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!slugEdited) {
                      setValue("slug", slugify(e.target.value), { shouldValidate: true });
                    }
                  },
                })}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.slug}>
              <FieldLabel required>Slug</FieldLabel>
              <Input
                placeholder="category-slug"
                leftIcon={<Link />}
                {...register("slug", {
                  required: "Slug is required",
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    setSlugEdited(true);
                    setValue("slug", slugify(e.target.value), { shouldValidate: true });
                  },
                })}
              />
              <FieldDescription icon={<Globe />}>{URL + slug + "...."}</FieldDescription>
              <FieldError errors={[errors.slug]} />
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea placeholder="What this category is for...." {...register("description")} />
            </Field>
            <Field data-invalid={!!errors.icon}>
              <FieldLabel required>Category Icon</FieldLabel>
              <Controller
                control={control}
                name="icon"
                rules={{ required: "Please select an icon" }}
                render={({ field }) => (
                  <IconPicker value={field.value} onChange={field.onChange} />
                )}
              />
              <FieldError errors={[errors.icon]} />
            </Field>
          </FieldGroup>
        </form>

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
            type="submit"
            form="add-category-form"
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
