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

const PROFILE_CACHE_KEY = "profile";
const PROFILE_CACHE_TTL_MS = 60 * 1000;

interface CachedProfile {
  token: string;
  user: User;
  savedAt: number;
}

function readCachedProfile(token: string): User | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedProfile;
    if (cached.token !== token || Date.now() - cached.savedAt > PROFILE_CACHE_TTL_MS) {
      sessionStorage.removeItem(PROFILE_CACHE_KEY);
      return null;
    }
    return cached.user;
  } catch {
    return null;
  }
}

function safeStorage(action: () => void) {
  try {
    action();
  } catch {
    return;
  }
}

function writeCachedProfile(token: string, user: User) {
  const entry: CachedProfile = { token, user, savedAt: Date.now() };
  safeStorage(() => sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(entry)));
}

function clearCachedProfile() {
  safeStorage(() => sessionStorage.removeItem(PROFILE_CACHE_KEY));
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function fetchUser() {
      const token = getAccessToken();
      if (!token) {
        if (!ignore) setIsLoading(false);
        return;
      }

      const cached = readCachedProfile(token);
      if (cached) {
        if (!ignore) {
          setUser(cached);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await UserService.myProfile();
        writeCachedProfile(token, res.data);
        if (!ignore) setUser(res.data);
      } catch {
        clearCachedProfile();
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
    const token = getAccessToken();
    if (!token) {
      clearCachedProfile();
      setUser(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await UserService.myProfile();
      writeCachedProfile(token, res.data);
      setUser(res.data);
    } catch {
      clearCachedProfile();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPermission = React.useCallback(
    (permission: string) => Boolean(user?.superAdmin || user?.permissions.includes(permission)),
    [user],
  );

  const clearUser = React.useCallback(() => {
    clearCachedProfile();
    setUser(null);
  }, []);

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
