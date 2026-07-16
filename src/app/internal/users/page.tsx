"use client";

import { useEffect, useState } from "react";
import { UserCircle, UserStar } from "lucide-react";
import AppHeader from "@/components/layout/app/AppHeader";
import { Tabs } from "@/components/ui/Tabs";
import { TabsHeader } from "@/components/ui/TabsHeader";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { FilterItem } from "@/types/Search";
import { UserType } from "@/types/User";
import { ALL_USERS } from "./_components/userData";
import UserTable from "./_components/UserTable";

const INITIAL_FILTERS: FilterItem[] = [
  {
    key: "userName",
    label: "User name",
    component: "AUTOSELECT",
    value: null,
    options: [],
    searchValue: "",
  },
  {
    key: "email",
    label: "Email",
    component: "AUTOSELECT",
    value: null,
    options: [],
    searchValue: "",
  },
  {
    key: "status",
    label: "Status",
    component: "DROPDOWN",
    value: null,
    options: [],
    searchValue: "",
  },
  {
    key: "joinedDate",
    label: "Joined Date",
    component: "DATE_RANGE",
    value: null,
    options: [],
    searchValue: "",
  },
];

const externalCount = ALL_USERS.filter((u) => u.userType === UserType.EXTERNAL).length;
const internalCount = ALL_USERS.filter((u) => u.userType === UserType.INTERNAL).length;

export default function UserListing() {
  const [activeTab, setActiveTab] = useState<UserType>(UserType.EXTERNAL);
  const { filters, resetFilters } = useSearchFilter();

  useEffect(() => {
    resetFilters(INITIAL_FILTERS);
  }, [resetFilters]);

  return (
    <div className="flex flex-col ">
      <AppHeader
        title={"User Management"}
        subtitle={"Community members and the team who keeps them safe."}
        count={30}
        buttonLabel={"Add new Admin"}
        onButtonPress={() => {
          console.log("Add new Admin");
        }}
        filters={filters}
      />
      <div className="my-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserType)}>
          <TabsHeader
            variant="pills"
            items={[
              {
                value: UserType.EXTERNAL,
                label: UserType.EXTERNAL,
                icon: <UserCircle className="size-4" />,
                count: externalCount,
              },
              {
                value: UserType.INTERNAL,
                label: UserType.INTERNAL,
                icon: <UserStar className="size-4" />,
                count: internalCount,
              },
            ]}
          />
        </Tabs>
      </div>
      <UserTable tab={activeTab} />
    </div>
  );
}
