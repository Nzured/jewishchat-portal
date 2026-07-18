import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import { CategoryColor } from "@/types/Category";
import { ALL_ICON_NAMES } from "./categoryIcons";

const FALLBACK_ICON_NAME = "tag";

const COLOR_STYLES: Record<CategoryColor, string> = {
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  rose: "bg-rose-100 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

const FALLBACK_COLORS = Object.keys(COLOR_STYLES) as CategoryColor[];

/** The API doesn't return a color, so derive a stable one from the icon name. */
function fallbackColorFor(seed: string): CategoryColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

interface CategoryIconProps {
  icon: string;
  color?: CategoryColor;
  className?: string;
}

export function CategoryIcon({ icon, color, className }: CategoryIconProps) {
  const resolvedColor = color ?? fallbackColorFor(icon);
  const resolvedIcon = ALL_ICON_NAMES.includes(icon) ? icon : FALLBACK_ICON_NAME;

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4.5",
        COLOR_STYLES[resolvedColor],
        className,
      )}
    >
      <DynamicIcon name={resolvedIcon as IconName} />
    </span>
  );
}
