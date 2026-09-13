"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageCropper, type CropRect } from "@/components/ui/ImageCropper";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { Typography } from "@/components/ui/Typography";
import { IMAGE_ACCEPTED_TYPES, IMAGE_MAX_FILE_SIZE } from "@/configs/const";
import { cn } from "@/lib/utils";

const PREVIEW_HEIGHT = 260;
const MAX_OUTPUT_SIZE = 1024;

interface ChangePhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  hint?: string;
  crop?: boolean;
  aspect?: number;
  circular?: boolean;
  saveLabel?: string;
  onSave: (file: File) => Promise<void> | void;
}

function validateImage(file: File): string | null {
  if (!IMAGE_ACCEPTED_TYPES.includes(file.type)) return "Use a JPG, PNG, or WebP image.";
  if (file.size > IMAGE_MAX_FILE_SIZE) return "Image must be smaller than 5 MB.";
  return null;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

export function ChangePhotoModal({
  open,
  onOpenChange,
  title,
  hint = "JPG, PNG or WebP. Square works best, anything else can be cropped.",
  crop = false,
  aspect = 1,
  circular = false,
  saveLabel = "Save Photo",
  onSave,
}: ChangePhotoModalProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDraggingFile, setIsDraggingFile] = React.useState(false);
  const [cropRect, setCropRect] = React.useState<CropRect | null>(null);

  React.useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const reset = React.useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setCropRect(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const acceptFile = (picked: File | null | undefined) => {
    if (!picked) return;

    const message = validateImage(picked);
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
    setCropRect(null);
  };

  const buildCroppedFile = async (source: File, url: string): Promise<File> => {
    if (!cropRect) return source;

    const image = await loadImage(url);
    const outputWidth = Math.min(MAX_OUTPUT_SIZE, Math.round(cropRect.width));
    const outputHeight = Math.round(outputWidth / aspect);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return source;

    context.drawImage(
      image,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, source.type, 0.92),
    );
    if (!blob) return source;

    return new File([blob], source.name, { type: source.type });
  };

  const handleSave = async () => {
    if (!file || !previewUrl) return;

    setIsSaving(true);
    try {
      await onSave(crop ? await buildCroppedFile(file, previewUrl) : file);
      handleOpenChange(false);
    } catch {
      setError("That photo could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>

        <div className="flex flex-col gap-3 px-5 py-4">
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={IMAGE_ACCEPTED_TYPES.join(",")}
            onChange={(event) => acceptFile(event.target.files?.[0])}
          />

          {previewUrl ? (
            <div className="flex flex-col gap-3">
              {crop ? (
                <>
                  <ImageCropper
                    src={previewUrl}
                    aspect={aspect}
                    circular={circular}
                    onChange={setCropRect}
                  />
                  <Typography variant="xs" className="text-ink-4">
                    Drag the box to reposition it, or pull a corner to resize the area that is kept.
                  </Typography>
                </>
              ) : (
                <div
                  style={{ height: PREVIEW_HEIGHT }}
                  className={cn(
                    "relative overflow-hidden bg-surface-bg",
                    circular ? "mx-auto aspect-square rounded-full" : "w-full rounded-xl",
                  )}
                >
                  <img
                    src={previewUrl}
                    alt="Selected photo"
                    draggable={false}
                    className="size-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <Typography variant="xs" className="truncate text-ink-4">
                  {file?.name}
                </Typography>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  Choose another
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingFile(false);
                acceptFile(event.dataTransfer.files?.[0]);
              }}
              className={cn(
                "flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed px-8 py-10 text-center transition-colors",
                isDraggingFile
                  ? "border-brand-green bg-state-bg-success"
                  : "border-brand-green/30 bg-state-bg-success/40 hover:border-brand-green/60",
              )}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-green">
                <ImageIcon className="size-5" />
              </span>
              <span className="flex flex-col gap-1">
                <Typography as="span" variant="large" className="text-ink-1">
                  Choose an image
                </Typography>
                <Typography as="span" variant="xs" className="text-ink-4">
                  {hint}
                </Typography>
              </span>
            </button>
          )}

          {error && (
            <Typography variant="xs" className="text-state-danger">
              {error}
            </Typography>
          )}
        </div>

        <ModalFooter>
          <ModalClose asChild>
            <Button type="button" variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </ModalClose>
          {file && (
            <Button
              type="button"
              color="primary"
              disabled={isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? "Saving..." : saveLabel}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
