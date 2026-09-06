"use client";

import * as React from "react";
import { Logo } from "@public/svgs";
import { ChevronRight, Menu, Plus, X } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { VisuallyHidden } from "radix-ui";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Typography } from "@/components/ui/Typography";
import {
  EXTERNAL_GROUPS_PATH,
  EXTERNAL_HOME_PATH,
  EXTERNAL_PROFILE_PATH,
  NAME_PART_ONE,
  NAME_PART_TWO,
} from "@/configs/const";
import { EXTERNAL_NAV_LINKS } from "@/configs/externalNav";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { UserMenu } from "../app/UserMenu";

const ADD_GROUP_LINK = EXTERNAL_NAV_LINKS.find((link) => link.label === "Add Group");
const DRAWER_NAV_LINKS = EXTERNAL_NAV_LINKS.filter((link) => link !== ADD_GROUP_LINK);
const MY_LISTINGS_LINK = { label: "My Listings", href: `${EXTERNAL_GROUPS_PATH}/mine` };

const STUCK_AFTER_PX = 40;

export function ExternalNavbar() {
  const { user, isLoading } = useUser();
  const { logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    let stuck: boolean | null = null;
    const update = () => {
      const next = window.scrollY > STUCK_AFTER_PX;
      if (next === stuck) return;
      stuck = next;
      el.classList.toggle("is-stuck", next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const desktopNavLinks = [...EXTERNAL_NAV_LINKS, ...(user ? [MY_LISTINGS_LINK] : [])];

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-transparent px-4 transition-[background-color,border-color,backdrop-filter] duration-500 md:px-6",
        "[&.is-stuck]:border-surface-line [&.is-stuck]:bg-surface-bg/80 [&.is-stuck]:backdrop-blur-xl",
        "motion-reduce:transition-none",
      )}
    >
      <Link
        href={EXTERNAL_HOME_PATH}
        className="shrink-0 items-center gap-2 text-ink-1 no-underline hover:text-ink-1 hover:no-underline"
      >
        <Image
          src={Logo as StaticImageData}
          alt="JewishChat"
          width={28}
          height={28}
          className="shrink-0 rounded-full"
        />
        <Typography as="span" className="hidden text-base font-semibold text-ink-1 sm:inline">
          {NAME_PART_ONE + NAME_PART_TWO}
        </Typography>
      </Link>

      <nav className="hidden items-center gap-6 lg:flex">
        {desktopNavLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-ink-2 no-underline transition-colors hover:text-ink-1 hover:no-underline",
                isActive && "text-brand-green",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        {!isLoading &&
          (user ? (
            <div className="hidden lg:block">
              <UserMenu />
            </div>
          ) : (
            <>
              <Button variant="link" color="primary" size="sm" asChild>
                <NextLink href="/login">Login</NextLink>
              </Button>
              <Button
                variant="default"
                color="primary"
                size="sm"
                className="hidden min-w-[120px] sm:inline-flex"
                asChild
              >
                <NextLink href="/signup">Sign Up</NextLink>
              </Button>
            </>
          ))}

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="icon" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="flex-row items-center justify-between border-b border-surface-line px-4 py-3">
              <VisuallyHidden.Root>
                <SheetTitle>Menu</SheetTitle>
              </VisuallyHidden.Root>
              <div className="flex items-center gap-2">
                <Image
                  src={Logo as StaticImageData}
                  alt="JewishChat"
                  width={24}
                  height={24}
                  className="shrink-0 rounded-full"
                />
                <Typography as="span" className="text-base font-semibold text-ink-1">
                  {NAME_PART_ONE + NAME_PART_TWO}
                </Typography>
              </div>
              <SheetClose
                aria-label="Close menu"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-bg hover:text-ink-1"
              >
                <X className="size-5" />
              </SheetClose>
            </SheetHeader>

            <div className="flex h-full min-h-0 flex-col">
              <div className="flex flex-col gap-4 p-4">
                {ADD_GROUP_LINK && (
                  <Button asChild>
                    <NextLink href={ADD_GROUP_LINK.href}>
                      {ADD_GROUP_LINK.label}
                      <Plus className="size-4" />
                    </NextLink>
                  </Button>
                )}

                <nav className="flex flex-col divide-y divide-surface-line">
                  {[...DRAWER_NAV_LINKS, ...(user ? [MY_LISTINGS_LINK] : [])].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between py-3 text-base font-semibold text-ink-1 no-underline transition-colors hover:text-brand-green hover:no-underline"
                    >
                      {link.label}
                      <ChevronRight className="size-4 shrink-0 text-ink-3" />
                    </Link>
                  ))}
                </nav>
              </div>

              {!isLoading && (
                <div className="mt-auto border-t border-surface-line p-4">
                  {user ? (
                    <div className="flex flex-col gap-3">
                      <NextLink
                        href={EXTERNAL_PROFILE_PATH}
                        className="flex items-center gap-3 rounded-lg transition-colors hover:bg-surface-bg"
                      >
                        <Avatar variant="circle" name={fullName} src={user.profilePic} />
                        <div className="flex flex-col">
                          <Typography variant="small" className="font-semibold text-ink-1">
                            {fullName}
                          </Typography>
                          <Typography variant="xs" className="text-ink-3">
                            {user.email}
                          </Typography>
                        </div>
                      </NextLink>
                      <Button variant="secondary" color="primary" asChild>
                        <NextLink href={EXTERNAL_PROFILE_PATH}>View Profile</NextLink>
                      </Button>
                      <Button variant="secondary" color="danger" onClick={() => void logout()}>
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button variant="secondary" color="primary" className="flex-1" asChild>
                        <NextLink href="/login">Log In</NextLink>
                      </Button>
                      <Button variant="default" color="primary" className="flex-1" asChild>
                        <NextLink href="/signup">Sign up</NextLink>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
