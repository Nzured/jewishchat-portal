"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Corner = "nw" | "ne" | "sw" | "se";

interface ImageCropperProps {
  src: string;
  aspect?: number;
  circular?: boolean;
  maxHeight?: number;
  onChange: (crop: CropRect) => void;
  className?: string;
}

const MIN_CROP_SIZE = 40;

const CORNERS: { corner: Corner; className: string }[] = [
  { corner: "nw", className: "-top-1.5 -left-1.5 cursor-nwse-resize" },
  { corner: "ne", className: "-top-1.5 -right-1.5 cursor-nesw-resize" },
  { corner: "sw", className: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
  { corner: "se", className: "-right-1.5 -bottom-1.5 cursor-nwse-resize" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function centeredCrop(width: number, height: number, aspect: number): CropRect {
  const cropWidth = Math.min(width, height * aspect);
  const cropHeight = cropWidth / aspect;
  return {
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

export function ImageCropper({
  src,
  aspect = 1,
  circular = false,
  maxHeight = 320,
  onChange,
  className,
}: ImageCropperProps) {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [bounds, setBounds] = React.useState({ width: 0, height: 0 });
  const [crop, setCrop] = React.useState<CropRect | null>(null);
  const gesture = React.useRef<{
    kind: "move" | Corner;
    startX: number;
    startY: number;
    start: CropRect;
  } | null>(null);

  const measure = React.useCallback(() => {
    const image = imageRef.current;
    if (!image || !image.complete || !image.naturalWidth) return;
    const next = { width: image.clientWidth, height: image.clientHeight };
    setBounds(next);
    setCrop(centeredCrop(next.width, next.height, aspect));
  }, [aspect]);

  React.useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const observer = new ResizeObserver(measure);
    observer.observe(image);
    return () => observer.disconnect();
  }, [measure]);

  React.useEffect(() => {
    const image = imageRef.current;
    if (!crop || !image || !bounds.width) return;
    const scale = image.naturalWidth / bounds.width;
    onChange({
      x: crop.x * scale,
      y: crop.y * scale,
      width: crop.width * scale,
      height: crop.height * scale,
    });
  }, [crop, bounds.width, onChange]);

  const startGesture = (kind: "move" | Corner, event: React.PointerEvent<HTMLElement>) => {
    if (!crop) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { kind, startX: event.clientX, startY: event.clientY, start: crop };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const active = gesture.current;
    if (!active) return;

    const dx = event.clientX - active.startX;
    const dy = event.clientY - active.startY;
    const { start } = active;

    if (active.kind === "move") {
      setCrop({
        ...start,
        x: clamp(start.x + dx, 0, bounds.width - start.width),
        y: clamp(start.y + dy, 0, bounds.height - start.height),
      });
      return;
    }

    const growsRight = active.kind === "ne" || active.kind === "se";
    const growsDown = active.kind === "sw" || active.kind === "se";
    const anchorX = growsRight ? start.x : start.x + start.width;
    const anchorY = growsDown ? start.y : start.y + start.height;

    const maxWidth = growsRight ? bounds.width - anchorX : anchorX;
    const maxHeightPx = growsDown ? bounds.height - anchorY : anchorY;

    const widthFromX = start.width + (growsRight ? dx : -dx);
    const widthFromY = (start.height + (growsDown ? dy : -dy)) * aspect;
    const width = clamp(
      Math.max(widthFromX, widthFromY),
      MIN_CROP_SIZE,
      Math.min(maxWidth, maxHeightPx * aspect),
    );
    const height = width / aspect;

    setCrop({
      x: growsRight ? anchorX : anchorX - width,
      y: growsDown ? anchorY : anchorY - height,
      width,
      height,
    });
  };

  const endGesture = (event: React.PointerEvent<HTMLElement>) => {
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className={cn("flex justify-center overflow-hidden rounded-xl bg-ink-1", className)}>
      <div className="relative inline-block touch-none select-none">
        <img
          ref={imageRef}
          src={src}
          alt="Photo to crop"
          draggable={false}
          onLoad={measure}
          style={{ maxHeight }}
          className="block h-auto w-auto max-w-full"
        />

        {crop && (
          <div
            role="presentation"
            onPointerDown={(event) => startGesture("move", event)}
            onPointerMove={handlePointerMove}
            onPointerUp={endGesture}
            onPointerCancel={endGesture}
            style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height }}
            className="absolute cursor-move"
          >
            <div
              className={cn(
                "absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]",
                circular ? "rounded-full" : "",
              )}
            />
            <div className="absolute inset-0 border-2 border-white/90">
              <div className="absolute inset-y-0 left-1/3 border-l border-white/40" />
              <div className="absolute inset-y-0 left-2/3 border-l border-white/40" />
              <div className="absolute inset-x-0 top-1/3 border-t border-white/40" />
              <div className="absolute inset-x-0 top-2/3 border-t border-white/40" />
            </div>

            {CORNERS.map(({ corner, className: cornerClassName }) => (
              <span
                key={corner}
                onPointerDown={(event) => startGesture(corner, event)}
                onPointerMove={handlePointerMove}
                onPointerUp={endGesture}
                onPointerCancel={endGesture}
                className={cn(
                  "absolute size-3.5 rounded-full border-2 border-brand-green bg-white",
                  cornerClassName,
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
