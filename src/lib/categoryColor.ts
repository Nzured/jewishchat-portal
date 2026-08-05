import { CategoryColor } from "@/types/Category";

export const CATEGORY_COLOR_STYLES: Record<CategoryColor, string> = {
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  rose: "bg-rose-100 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

const FALLBACK_COLORS = Object.keys(CATEGORY_COLOR_STYLES) as CategoryColor[];

/** Categories don't always carry a color, so derive a stable one from a seed (e.g. icon name or id). */
export function fallbackCategoryColor(seed: string): CategoryColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

/** Tailwind bg/text classes for a category's color, falling back to a seed-derived one. */
export function categoryColorClasses(color: CategoryColor | undefined, seed: string) {
  return CATEGORY_COLOR_STYLES[color ?? fallbackCategoryColor(seed)];
}
