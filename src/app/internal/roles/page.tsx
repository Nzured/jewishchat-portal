"use client";

import { useEffect, useState } from "react";
import { useRoles } from "@/app/internal/roles/_context/RoleContext";
import AppHeader from "@/components/layout/app/AppHeader";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { FilterItem, FilterOption } from "@/types/Search";
import { AddRoleModal } from "./_components/AddRoleModal";
import RoleTable from "./_components/RoleTable";

const INITIAL_FILTERS: FilterItem[] = [
  {
    key: "role",
    label: "Role",
    component: "AUTOSELECT",
    value: null,
    options: [],
    searchValue: "",
  },
  {
    key: "userCount",
    label: "User Count",
    component: "NUMBER_RANGE",
    value: null,
    options: [],
    searchValue: "",
  },
];

export default function RoleListingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { roles, rolesLoading } = useRoles();
  const { filters, resetFilters, updateFilterOptions } = useSearchFilter();

  useEffect(() => {
    resetFilters(INITIAL_FILTERS);
  }, [resetFilters]);

  useEffect(() => {
    const ROLE_NAME_FILTER_OPTIONS: FilterOption[] = Array.from(
      new Set(roles.map((role) => role.name)),
    ).map((name) => ({ label: name, value: name }));

    updateFilterOptions("role", ROLE_NAME_FILTER_OPTIONS);
  }, [roles, updateFilterOptions]);

  return (
    <>
      <AppHeader
        title="Role Management"
        subtitle="A role is a named set of permissions assigned to internal users. What each role can do is defined here; who holds it is set per user."
        filters={filters}
        buttonLabel="Add Role"
        onButtonPress={() => setModalOpen(true)}
      />
      <div className="mt-6">
        <RoleTable data={roles} loading={rolesLoading} />
      </div>
      <AddRoleModal open={modalOpen} setOpen={setModalOpen} />
    </>
  );
}
