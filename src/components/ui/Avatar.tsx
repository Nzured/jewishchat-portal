"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Typography } from "./Typography";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold select-none",
  {
    variants: {
      variant: {
        tile: "rounded-lg",
        circle: "rounded-full",
      },
      size: {
        sm: "size-6 text-[10px]",
        md: "size-9 text-xs",
        lg: "size-11 text-sm",
        xl: "size-15 text-xl",
      },
    },
    defaultVariants: {
      variant: "tile",
      size: "md",
    },
  },
);

const colorPalette = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
] as const;

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

interface AvatarProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
}

function Avatar({
  src,
  alt,
  name = "",
  variant = "tile",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const resolvedInitials = getInitials(name);
  const seed = name || alt || "";
  const { bg, text } = colorPalette[hashString(seed) % colorPalette.length];
  const showImage = Boolean(src) && !imageFailed;

  return (
    <span
      data-slot="avatar"
      className={cn(
        avatarVariants({ variant, size }),
        !showImage && bg,
        !showImage && text,
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name}
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Typography
          as="span"
          className="text-inherit leading-none"
          aria-hidden={Boolean(alt || name) || undefined}
        >
          {resolvedInitials}
        </Typography>
      )}
    </span>
  );
}

export { Avatar, avatarVariants };
export type { AvatarProps };
