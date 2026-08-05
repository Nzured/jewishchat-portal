import type { ComponentProps } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { cn } from "@/lib/utils";

function toIconName(name: string): IconName {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase() as IconName;
}

/** Lucide slugs are ASCII letters/digits/separators; anything else is an emoji glyph. */
function isLucideSlug(name: string) {
  return /^[A-Za-z0-9\s_-]+$/.test(name);
}

interface IconProps extends Omit<ComponentProps<typeof DynamicIcon>, "name"> {
  name: string;
}

function Icon({ name, className, style, ...props }: IconProps) {
  // Categories carry either a lucide slug ("pie-chart") or a literal emoji ("🎉").
  if (!isLucideSlug(name)) {
    return (
      <span
        role="img"
        aria-hidden
        className={cn("inline-flex items-center justify-center leading-none", className)}
        style={style}
      >
        {name}
      </span>
    );
  }

  return <DynamicIcon name={toIconName(name)} className={className} style={style} {...props} />;
}

export { Icon };
export type { IconProps };
