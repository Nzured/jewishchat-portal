"use client";

import * as React from "react";
import { UserService } from "@/services/user/user.service";
import { User } from "@/types/User";

interface UserManagementContextType {
  users: User[];
  loading: boolean;
  fetchUserDetails: (userId: string) => Promise<User | undefined>;
}

const UserContext = React.createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await UserService.fetchAdminUsers({});
        if (!res.data && res) throw new Error("No data received");
        setUsers(res.data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchUsers();
  }, []);

  const fetchUserDetails = React.useCallback(async (userId: string) => {
    if (userId === undefined || userId === null || userId === "") return;
    const res = await UserService.getUser(userId);
    if (!res || !res.data) throw new Error("No data received");
    return res.data;
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, fetchUserDetails }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserManagementContext() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserManagementContext must be used within a UserManagementProvider");
  }
  return context;
}
