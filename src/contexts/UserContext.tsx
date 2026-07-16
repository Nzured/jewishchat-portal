"use client";

import * as React from "react";
import { getAccessToken } from "@/lib/auth";
import { UserService } from "@/services/user/user.service";
import { User } from "@/types/User";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  refetchUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(() => Boolean(getAccessToken()));

  // Fetch on mount only. The async function is declared and invoked inline so
  // its setState calls only ever run after the `await`, never synchronously
  // within the effect body.
  React.useEffect(() => {
    if (!getAccessToken()) return;

    let ignore = false;

    async function fetchUser() {
      try {
        const res = await UserService.myProfile();
        if (!ignore) setUser(res.data);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchUser();

    return () => {
      ignore = true;
    };
  }, []);

  const refetchUser = React.useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await UserService.myProfile();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = React.useCallback(
    (permission: string) => Boolean(user?.superAdmin || user?.permissions.includes(permission)),
    [user],
  );

  const clearUser = React.useCallback(() => setUser(null), []);

  return (
    <UserContext.Provider value={{ user, isLoading, hasPermission, refetchUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
