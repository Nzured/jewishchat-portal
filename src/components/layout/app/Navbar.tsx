"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { UserMenu } from "./UserMenu";

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
}

interface NavbarProps {
  title?: string;
  notifications?: AppNotification[];
  onMenuClick?: () => void;
}

export function Navbar({ title = "", notifications = [], onMenuClick }: NavbarProps) {
  const hasNotifications = notifications.length > 0;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-line px-6 bg-surface-card">
      <div className="flex items-center gap-3">
        <Button
          variant="icon"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </Button>
        <Typography variant="h4">{title}</Typography>
      </div>
      <div className="flex flex-row items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="icon" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-5 mt-1" />
              {hasNotifications && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-state-danger" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="">
            <PopoverHeader>
              <PopoverTitle>Notifications</PopoverTitle>
            </PopoverHeader>
            {hasNotifications ? (
              <ul className="flex flex-col gap-3">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <Typography variant="small" className="font-medium">
                      {notification.title}
                    </Typography>
                    {notification.description && (
                      <PopoverDescription>{notification.description}</PopoverDescription>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <PopoverDescription>You&apos;re all caught up.</PopoverDescription>
            )}
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="bg-surface-line" />
        <UserMenu />
      </div>
    </header>
  );
}
