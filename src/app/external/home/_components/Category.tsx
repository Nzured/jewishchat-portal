"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_CATEGORIES_PATH, EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { categoryColorClasses } from "@/lib/categoryColor";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";
import { CategoryColor } from "@/types/Category";

export const Category = ({
  icon,
  name,
  slug,
  description,
  count,
  color,
}: {
  icon?: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  color?: CategoryColor;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        xTo(((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 12);
        yTo(((event.clientY - (rect.top + rect.height / 2)) / rect.height) * 12);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[22px] border border-surface-line bg-surface-card p-6 transition-colors duration-500 will-change-transform hover:border-brand-green/45"
    >
      <span className="pointer-events-none absolute -top-16 -left-16 size-40 scale-0 rounded-full bg-brand-softer transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[3.2]" />

      <NextLink
        href={`${EXTERNAL_CATEGORIES_PATH}/${encodeURIComponent(slug)}`}
        aria-label={name}
        className="absolute inset-0 z-10 rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
      />

      <div className="pointer-events-none relative z-20">
        {icon && (
          <span
            className={cn(
              "mb-5 inline-flex size-12 items-center justify-center rounded-[14px] transition-transform duration-500 group-hover:scale-105",
              categoryColorClasses(color, icon),
            )}
          >
            <Icon name={icon} className="size-5" />
          </span>
        )}

        <Typography as="h3" variant="large" className="font-display leading-snug text-ink-1">
          {name}
        </Typography>

        {description && (
          <Typography variant="small" className="mt-2 leading-relaxed text-ink-3">
            {description}
          </Typography>
        )}
      </div>

      <div className="pointer-events-none relative z-20 mt-6 flex items-center justify-between gap-3">
        <Link
          href={`${EXTERNAL_GROUPS_PATH}?category=${encodeURIComponent(slug)}`}
          className="pointer-events-auto text-xs text-ink-4 underline-offset-4 transition-colors hover:text-brand-green"
        >
          {count && count > 0 ? `${count.toLocaleString()} groups` : "Browse groups"}
        </Link>
        <ArrowUpRight
          size={17}
          className="-translate-x-1 shrink-0 text-ink-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:text-brand-green group-hover:opacity-100"
        />
      </div>
    </div>
  );
};
