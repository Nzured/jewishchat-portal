"use client";

import { useState } from "react";
import AppHeader from "@/components/layout/app/AppHeader";
import { FilterItem } from "@/types/Search";
import { AddRoleModal } from "./_components/AddRoleModal";
import RoleTable from "./_components/RoleTable";

export default function RoleListingPage() {
  const [modalOpen, setModalOpen] = useState(false);
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
      key: "users",
      label: "Users",
      component: "AUTOSELECT",
      value: null,
      options: [],
    },
    {
      key: "createdBy",
      label: "Created By",
      component: "AUTOSELECT",
      value: null,
      options: [],
      searchValue: "",
    },
  ];
  return (
    <>
      <AppHeader
        title="Role Management"
        subtitle="A role is a named set of permissions assigned to internal users. What each role can do is defined here; who holds it is set per user."
        filters={INITIAL_FILTERS}
        buttonLabel="Add Role"
        onButtonPress={() => setModalOpen(true)}
      />
      <div className="mt-6">
        <RoleTable />
      </div>
      <AddRoleModal open={modalOpen} setOpen={setModalOpen} onSubmit={() => {}} />
    </>
  );
}
