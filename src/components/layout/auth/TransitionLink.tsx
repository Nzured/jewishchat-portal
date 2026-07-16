"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Link, LinkProps } from "@/components/ui/Link";

interface TransitionLinkProps extends Omit<LinkProps, "href"> {
  href: string;
  direction?: "login-to-signup" | "signup-to-login";
}

export function TransitionLink({
  href,
  direction,
  children,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!document.startViewTransition) {
      router.push(href);
      return;
    }

    if (direction) {
      document.documentElement.classList.add(`nav-${direction}`);
    }

    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          router.push(href);

          // Polling for the URL change which indicates Next.js has mounted the new page
          const targetUrl = new URL(href, window.location.href);
          const targetPath = targetUrl.pathname;

          const check = setInterval(() => {
            if (window.location.pathname === targetPath) {
              clearInterval(check);
              setTimeout(resolve, 50);
            }
          }, 10);

          setTimeout(() => {
            clearInterval(check);
            resolve();
          }, 2000);
        }),
    );

    transition.finished
      .catch(() => {})
      .finally(() => {
        if (direction) {
          document.documentElement.classList.remove(`nav-${direction}`);
        }
      });
  };

  return (
    <Link href={href} onClick={handleNavigate} {...props}>
      {children}
    </Link>
  );
}
