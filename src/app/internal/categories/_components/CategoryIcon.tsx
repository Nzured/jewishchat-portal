import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { categoryColorClasses } from "@/lib/categoryColor";
import { cn } from "@/lib/utils";
import { CategoryColor } from "@/types/Category";
import { ALL_ICON_NAMES } from "./categoryIcons";

const FALLBACK_ICON_NAME = "tag";

interface CategoryIconProps {
  icon: string;
  color?: CategoryColor;
  className?: string;
}

export function CategoryIcon({ icon, color, className }: CategoryIconProps) {
  const resolvedIcon = ALL_ICON_NAMES.includes(icon) ? icon : FALLBACK_ICON_NAME;

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4.5",
        categoryColorClasses(color, icon),
        className,
      )}
    >
      <DynamicIcon name={resolvedIcon as IconName} />
    </span>
  );
}
