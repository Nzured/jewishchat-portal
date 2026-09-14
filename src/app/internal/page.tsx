import { DashboardServer } from "@/services/dashboard/dashboard.server";
import { DashboardClient } from "./_components/DashboardClient";
import { DEFAULT_PERIOD, PERIOD_TO_API } from "./_components/dashboardPeriod";

export default async function DashboardPage() {
  const initialOverview = await DashboardServer.getOverview({
    period: PERIOD_TO_API[DEFAULT_PERIOD],
  });

  return <DashboardClient initialOverview={initialOverview} />;
}
