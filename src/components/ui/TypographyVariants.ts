import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const typographyVariants = cva("text-ink-1", {
  variants: {
    variant: {
      title:
        "scroll-m-20 font-display text-4xl font-semibold tracking-tight sm:text-6xl lg:text-[96px] lg:leading-[95px] lg:tracking-[-0.06em]", // 96px, line-height 95px, letter-spacing -6% at desktop
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", // 36px (2.25rem), lg: 48px (3rem)
      h2: "scroll-m-20 text-3xl font-semibold", // 30px (1.875rem)
      h3: "scroll-m-20 text-base tracking-tight sm:text-2xl", // 16px (1rem), sm: 24px (1.5rem)
      h4: "scroll-m-20 text-xl font-semibold tracking-tight", // 20px (1.25rem)

      p: "leading-7", // line-height: 28px (1.75rem)

      blockquote: "mt-6 border-l-2 pl-6 italic", // inherits parent font size

      list: "my-6 ml-6 list-disc [&>li]:mt-2", // inherits parent font size

      inlineCode: "relative rounded bg-brand-soft px-[0.3rem] py-[0.2rem] font-mono", // 14px (0.875rem)

      lead: "text-xl", // 20px (1.25rem)

      large: "text-lg font-semibold", // 18px (1.125rem)

      small: "text-sm  leading-5", // 14px (0.875rem)

      muted: "text-sm text-ink-3", // 14px (0.875rem)

      tiny: "text-[11px] leading-none", // 11px

      xs: "text-xs leading-none text-ink-2", // 12px
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type VariantPropType = VariantProps<typeof typographyVariants>;

const variantElementMap: Record<NonNullable<VariantPropType["variant"]>, React.ElementType> = {
  title: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  blockquote: "blockquote",
  list: "ul",
  inlineCode: "code",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
  tiny: "span",
  xs: "span",
};

export { typographyVariants, variantElementMap };
export type { VariantPropType };
