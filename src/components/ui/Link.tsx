import * as React from "react";
import { ArrowRight } from "lucide-react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { typographyVariants } from "@/components/ui/TypographyVariants";
import { cn } from "@/lib/utils";

export interface LinkProps
  extends NextLinkProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> {
  children: React.ReactNode;
  arrow?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, children, arrow, ...props }, ref) => {
    return (
      <NextLink
        href={href}
        ref={ref}
        className={cn(
          typographyVariants({ variant: "p" }),
          "flex flex-row gap-2 text-[13px] font-medium text-brand-green hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-sm",
          className,
        )}
        {...props}
      >
        {children}
        {arrow && <ArrowRight className="size-3.5 shrink-0" />}
      </NextLink>
    );
  },
);
Link.displayName = "Link";

export { Link };
