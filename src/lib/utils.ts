import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

// Byte counts as a human-readable size, e.g. "1.4 MB" or "820 KB".
export function formatFileSize(bytes: number) {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return kb >= 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${kb} KB`;
}
