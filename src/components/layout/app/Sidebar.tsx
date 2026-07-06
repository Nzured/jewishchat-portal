"use client";

import * as React from "react";
import { Logo } from "@public/svgs";
import { PanelLeft, PanelLeftClose, X } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { SIDEBAR_NAV_BY_USER_TYPE } from "@/configs/sidebarNav";
import { cn } from "@/lib/utils";
import type { UserType } from "@/types/User";

interface SidebarProps {
  userType: UserType;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ userType, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const sections = SIDEBAR_NAV_BY_USER_TYPE[userType];

  React.useEffect(() => {
    onMobileOpenChange(false);
  }, [pathname, onMobileOpenChange]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => onMobileOpenChange(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-surface-line bg-surface-card transition-transform duration-200 ease-in-out",
          "lg:sticky lg:top-0 lg:inset-y-auto lg:left-auto lg:z-auto lg:translate-x-0 lg:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <Image
              src={Logo as StaticImageData}
              alt="JewishChat"
              width={28}
              height={28}
              className="shrink-0 rounded-full"
            />
            <Typography
              as="span"
              className={cn(
                "truncate text-base font-semibold text-ink-1",
                collapsed && "lg:hidden",
              )}
            >
              JewishChat
            </Typography>
          </div>
          <Button
            variant="icon"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            className="hidden shrink-0 lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? <PanelLeft className="size-5" /> : <PanelLeftClose className="size-5" />}
          </Button>
        </div>
        <Separator className="bg-surface-line" />
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          {sections.map((section, index) => (
            <div key={section.label ?? index} className="flex flex-col gap-1  px-3 ">
              {section.label && (
                <Typography
                  as="span"
                  className={cn(
                    "px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-ink-3",
                    collapsed && "lg:hidden",
                  )}
                >
                  {section.label}
                </Typography>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-brand-soft hover:text-ink-1",
                      isActive && " bg-brand-soft text-brand-green",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                  </NextLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
