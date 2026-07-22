"use client";

import { useCallback, useEffect, useState } from "react";
import { UserCircle, UserStar } from "lucide-react";
import AppHeader from "@/components/layout/app/AppHeader";
import { Tabs } from "@/components/ui/Tabs";
import { TabsHeader } from "@/components/ui/TabsHeader";
import { wordFormatter } from "@/configs/functions/WordFormatter";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { FilterItem, FilterOption } from "@/types/Search";
import { UserStatus, UserType } from "@/types/User";
import { AddInternalUserModal } from "./_components/AddInternalUserModal";
import UserTable from "./_components/UserTable";

const STATUS_OPTIONS: FilterOption[] = Object.values(UserStatus).map((status) => ({
  label: wordFormatter(status),
  value: status,
}));

const INITIAL_FILTERS: FilterItem[] = [
  {
    key: "userName",
    label: "User name",
    component: "TEXT_INPUT",
    value: null,
  },
  {
    key: "status",
    label: "Status",
    component: "DROPDOWN",
    value: null,
    options: STATUS_OPTIONS,
    searchValue: "",
  },
];

export default function UserListing() {
  const [activeTab, setActiveTab] = useState<UserType>(UserType.EXTERNAL);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [externalCount, setExternalCount] = useState(0);
  const [internalCount, setInternalCount] = useState(0);
  const { filters, resetFilters } = useSearchFilter();

  useEffect(() => {
    resetFilters(INITIAL_FILTERS);
  }, [resetFilters]);

  const handleCountChange = useCallback((tab: UserType, total: number) => {
    if (tab === UserType.EXTERNAL) setExternalCount(total);
    else setInternalCount(total);
  }, []);

  return (
    <div className="flex flex-col ">
      <AppHeader
        title={"User Management"}
        subtitle={"Community members and the team who keeps them safe."}
        buttonLabel={"Add new Admin"}
        onButtonPress={() => setAddUserModalOpen(true)}
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
      <UserTable tab={activeTab} onCountChange={handleCountChange} />
      <AddInternalUserModal
        open={addUserModalOpen}
        setOpen={setAddUserModalOpen}
        onInvite={() => {}}
      />
    </div>
  );
}
