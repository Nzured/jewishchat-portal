"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { ImageIcon, X } from "lucide-react";
import { Controller } from "react-hook-form";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/Attachment";
import { Field, FieldError } from "@/components/ui/Field";
import { Progress } from "@/components/ui/Progress";
import { IMAGE_ACCEPTED_TYPES, IMAGE_MAX_FILE_SIZE } from "@/configs/const";
import { formatFileSize } from "@/lib/utils";
import type { CreateGroupFormValues } from "@/types/Group";
import type { Control, FieldError as FieldErrorType, FieldErrors } from "react-hook-form";

interface GroupImageUploaderProps {
  control: Control<CreateGroupFormValues>;
  errors: FieldErrors<CreateGroupFormValues>;
  /** 0-100 while the photo is being uploaded, null when no upload is running. */
  uploadProgress?: number | null;
}

function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return url;
}

export default function GroupImageUploader({
  control,
  errors,
  uploadProgress = null,
}: GroupImageUploaderProps) {
  return (
    <Controller
      control={control}
      name="image"
      rules={{
        validate: (file) => {
          if (!file) return true;
          if (!IMAGE_ACCEPTED_TYPES.includes(file.type)) return "Use a JPG, PNG, or WebP image";
          if (file.size > IMAGE_MAX_FILE_SIZE) return "Image must be smaller than 5 MB";
          return true;
        },
      }}
      render={({ field }) => (
        <ImagePicker
          file={field.value ?? null}
          onFileChange={field.onChange}
          error={errors.image}
          uploadProgress={uploadProgress}
        />
      )}
    />
  );
}

function ImagePicker({
  file,
  onFileChange,
  error,
  uploadProgress,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: FieldErrorType;
  uploadProgress: number | null;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useObjectUrl(file);
  const isUploading = uploadProgress !== null;

  const openFilePicker = () => inputRef.current?.click();

  const removeFile = () => {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Field data-invalid={!!error}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={IMAGE_ACCEPTED_TYPES.join(",")}
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />

      {file ? (
        <Attachment
          state={isUploading ? "uploading" : error ? "error" : "done"}
          className="w-full gap-4 has-data-[slot=attachment-content]:px-4 has-data-[slot=attachment-content]:py-4 has-data-[slot=attachment-media]:p-4"
        >
          <AttachmentMedia variant="image" className="w-20 rounded-xl">
            {previewUrl && <img src={previewUrl} alt="" />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              {isUploading
                ? `Uploading… ${uploadProgress}%`
                : `${formatFileSize(file.size)} · Click to replace`}
            </AttachmentDescription>
            {isUploading && (
              <Progress
                value={uploadProgress}
                aria-label={`Uploading ${file.name}`}
                className="mt-2.5"
              />
            )}
          </AttachmentContent>
          {!isUploading && (
            <>
              <AttachmentActions className="pr-1">
                <AttachmentAction
                  aria-label="Remove image"
                  onClick={removeFile}
                  className="text-ink-3 hover:bg-state-bg-error hover:text-state-danger"
                >
                  <X />
                </AttachmentAction>
              </AttachmentActions>
              <AttachmentTrigger aria-label="Replace image" onClick={openFilePicker} />
            </>
          )}
        </Attachment>
      ) : (
        <Attachment
          state="idle"
          className="w-full flex-col justify-center gap-3 bg-surface-bg text-center has-data-[slot=attachment-content]:px-8 has-data-[slot=attachment-content]:py-8 has-data-[slot=attachment-media]:p-8"
        >
          <AttachmentMedia className="rounded-xl bg-brand-soft text-brand-green">
            <ImageIcon />
          </AttachmentMedia>
          <AttachmentContent className="flex-none">
            <AttachmentTitle className="text-base">Choose an image</AttachmentTitle>
            <AttachmentDescription className="text-ink-4">
              JPG, PNG or WebP. Square works best, anything else is cropped to 1:1.
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger aria-label="Choose an image" onClick={openFilePicker} />
        </Attachment>
      )}

      <FieldError errors={[error]} />
    </Field>
  );
}
