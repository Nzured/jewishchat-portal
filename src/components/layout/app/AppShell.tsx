"use client";

import * as React from "react";
import type { UserType } from "@/types/User";
import { Navbar, type AppNotification } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  title: string;
  userType: UserType;
  notifications?: AppNotification[];
  children: React.ReactNode;
}

export function AppShell({ title, userType, notifications = [], children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userType={userType}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar title="" notifications={notifications} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
