"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

const CROP_VIEWPORT_HEIGHT = 260;
const MAX_OUTPUT_SIZE = 1024;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
  const imageRef = React.useRef<HTMLImageElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const dragOrigin = React.useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDraggingFile, setIsDraggingFile] = React.useState(false);
  const [zoom, setZoom] = React.useState(MIN_ZOOM);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const reset = React.useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
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
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
  };

  const coverScale = () => {
    const image = imageRef.current;
    const viewport = viewportRef.current;
    if (!image || !viewport) return 1;

    return Math.max(
      viewport.clientWidth / image.naturalWidth,
      viewport.clientHeight / image.naturalHeight,
    );
  };

  const clampOffset = (next: { x: number; y: number }) => {
    const image = imageRef.current;
    const viewport = viewportRef.current;
    if (!image || !viewport) return next;

    const scale = coverScale() * zoom;
    const overflowX = Math.max(0, (image.naturalWidth * scale - viewport.clientWidth) / 2);
    const overflowY = Math.max(0, (image.naturalHeight * scale - viewport.clientHeight) / 2);

    return {
      x: clamp(next.x, -overflowX, overflowX),
      y: clamp(next.y, -overflowY, overflowY),
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current;
    if (!origin) return;

    setOffset(
      clampOffset({
        x: origin.offsetX + (event.clientX - origin.x),
        y: origin.offsetY + (event.clientY - origin.y),
      }),
    );
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragOrigin.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const buildCroppedFile = async (source: File): Promise<File> => {
    const image = imageRef.current;
    const viewport = viewportRef.current;
    if (!image || !viewport) return source;

    const scale = coverScale() * zoom;
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;

    const sourceX = (scaledWidth / 2 - offset.x - viewport.clientWidth / 2) / scale;
    const sourceY = (scaledHeight / 2 - offset.y - viewport.clientHeight / 2) / scale;
    const sourceWidth = viewport.clientWidth / scale;
    const sourceHeight = viewport.clientHeight / scale;

    const outputWidth = Math.min(MAX_OUTPUT_SIZE, Math.round(sourceWidth));
    const outputHeight = Math.round(outputWidth / aspect);

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d");
    if (!context) return source;

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
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
    if (!file) return;

    setIsSaving(true);
    try {
      await onSave(crop ? await buildCroppedFile(file) : file);
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
              <div
                ref={viewportRef}
                onPointerDown={crop ? handlePointerDown : undefined}
                onPointerMove={crop ? handlePointerMove : undefined}
                onPointerUp={crop ? endDrag : undefined}
                onPointerCancel={crop ? endDrag : undefined}
                style={{ height: CROP_VIEWPORT_HEIGHT }}
                className={cn(
                  "relative overflow-hidden bg-surface-bg",
                  circular ? "mx-auto aspect-square rounded-full" : "w-full rounded-xl",
                  crop && "cursor-grab touch-none active:cursor-grabbing",
                )}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Selected photo"
                  draggable={false}
                  onLoad={() => setOffset({ x: 0, y: 0 })}
                  style={
                    crop
                      ? {
                          transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        }
                      : undefined
                  }
                  className={cn(
                    "absolute top-1/2 left-1/2 max-w-none select-none",
                    crop ? "h-auto w-auto min-h-full min-w-full origin-center" : "",
                  )}
                />
              </div>

              {crop && (
                <label className="flex items-center gap-3">
                  <Typography as="span" variant="xs" className="shrink-0 text-ink-4">
                    Zoom
                  </Typography>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.01}
                    value={zoom}
                    onChange={(event) => {
                      setZoom(Number(event.target.value));
                      setOffset((current) => clampOffset(current));
                    }}
                    className="h-1 w-full cursor-pointer accent-brand-green"
                  />
                </label>
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
