import AppHeader from "@/components/layout/app/AppHeader";
import { UnderConstruction } from "@/components/ui/UnderConstruction";
import { FilterItem } from "@/types/Search";
import { ReportsTable } from "./_components/ReportTable";

const isCompleted = false;

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

  if (!isCompleted) {
    return (
      <UnderConstruction
        title="Report management is under construction"
        description="We're still building this out. Check back soon."
      />
    );
  }

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
