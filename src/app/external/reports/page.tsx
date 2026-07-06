import AppHeader from "@/components/layout/app/AppHeader";
import { FilterItem } from "@/types/Search";
import { ReportsTable } from "./_components/ReportTable";

export default function ReportPage() {
  const INITIAL_FILTERS: FilterItem[] = [
    {
      key: "groupName",
      label: "Group Name",
      component: "AUTOSELECT",
      value: null,
      options: [],
      searchValue: "",
    },
    {
      key: "reportCount",
      label: "Report Count",
      component: "NUMBER_INPUT",
      value: null,
      options: [],
    },
    {
      key: "category",
      label: "Category",
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
      key: "submittedBy",
      label: "Submitted By",
      component: "AUTOSELECT",
      value: null,
      options: [],
      searchValue: "",
    },
  ];
  return (
    <>
      <AppHeader
        title={"Report Management"}
        subtitle={"Manage reports flagged by the users. Review and suspend faulty groups."}
        count={30}
        filters={INITIAL_FILTERS}
      />
      <div className="mt-6">
        <ReportsTable />
      </div>
    </>
  );
}
