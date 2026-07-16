import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";
import { CategoryColor } from "@/types/Category";

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

interface CategoryIconProps {
  icon: string;
  color: CategoryColor;
  className?: string;
}

export function CategoryIcon({ icon, color, className }: CategoryIconProps) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4.5",
        COLOR_STYLES[color],
        className,
      )}
    >
      <DynamicIcon name={icon as IconName} />
    </span>
  );
}
