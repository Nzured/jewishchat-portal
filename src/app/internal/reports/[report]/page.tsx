"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { Banner } from "@/components/ui/Banner";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Category } from "@/types/Category";
import { Group, GroupStatus } from "@/types/Group";
import { Report as IReport, ReportCategories } from "@/types/Report";
import ActionsCard from "./_components/ActionsCard";
import GroupDetailsCard from "./_components/GroupDetailsCard";
import GroupNavigation from "./_components/GroupNavigation";
import ReportsListSection from "./_components/ReportsListSection";

interface GroupQueueEntry {
  reports: IReport[];
}

interface GroupSuspension {
  reasonLabel: string;
  remark: string;
  suspendedAt: string;
  suspendedBy: string;
}

const CATEGORY_COMMUNITY: Category = { id: 1, name: "Community", slug: "community", icon: "users" };
const CATEGORY_SOCIAL: Category = {
  id: 2,
  name: "Social",
  slug: "social",
  icon: "message-circle",
};
const CATEGORY_AUTOMOTIVE: Category = {
  id: 3,
  name: "Automotive",
  slug: "automotive",
  icon: "car",
};
const CATEGORY_MARKETPLACE: Category = {
  id: 4,
  name: "Marketplace",
  slug: "marketplace",
  icon: "shopping-bag",
};

const MOCK_GROUPS: Record<"g1" | "g2" | "g3", Group> = {
  g1: {
    uuid: "g1",
    slug: "/groups/jewish-community",
    name: "Jewish Community Chat",
    shortDesc: "A community group for local news and events.",
    about: "A community group for local news and events.",
    locationCity: "Brooklyn",
    locationState: "NY",
    locationCountry: "USA",
    memberCount: 150,
    status: GroupStatus.ACTIVE,
    linkVisibilityLoggedInOnly: false,
    submittedByUuid: "creator1",
    mainCategory: CATEGORY_COMMUNITY,
    categories: [CATEGORY_COMMUNITY, CATEGORY_SOCIAL],
    totalViews: 0,
    uniqueViews: 0,
    totalJoinClicks: 0,
    uniqueJoinClicks: 0,
    reportCount: 10,
    isOwnGroup: false,
    ownerProfileUrl: "",
    createdOn: "2023-05-20",
    updatedOn: "2026-06-20",
  },
  g2: {
    uuid: "g2",
    slug: "/groups/lakewood-auto-traders",
    name: "Lakewood Auto Traders",
    shortDesc: "Buy, sell, and trade vehicles and auto parts.",
    about: "Buy, sell, and trade vehicles and auto parts.",
    locationCity: "Lakewood",
    locationState: "NJ",
    locationCountry: "USA",
    memberCount: 612,
    status: GroupStatus.ACTIVE,
    linkVisibilityLoggedInOnly: false,
    submittedByUuid: "creator2",
    mainCategory: CATEGORY_AUTOMOTIVE,
    categories: [CATEGORY_AUTOMOTIVE, CATEGORY_MARKETPLACE],
    totalViews: 0,
    uniqueViews: 0,
    totalJoinClicks: 0,
    uniqueJoinClicks: 0,
    reportCount: 4,
    isOwnGroup: false,
    ownerProfileUrl: "",
    createdOn: "2022-09-18",
    updatedOn: "2026-06-13",
  },
  g3: {
    uuid: "g3",
    slug: "/groups/crown-heights-marketplace",
    name: "Crown Heights Marketplace",
    shortDesc: "Local listings and community marketplace.",
    about: "Local listings and community marketplace.",
    locationCity: "Brooklyn",
    locationState: "NY",
    locationCountry: "USA",
    memberCount: 894,
    status: GroupStatus.ACTIVE,
    linkVisibilityLoggedInOnly: false,
    submittedByUuid: "creator3",
    mainCategory: CATEGORY_MARKETPLACE,
    categories: [CATEGORY_MARKETPLACE, CATEGORY_COMMUNITY],
    totalViews: 0,
    uniqueViews: 0,
    totalJoinClicks: 0,
    uniqueJoinClicks: 0,
    reportCount: 6,
    isOwnGroup: false,
    ownerProfileUrl: "",
    createdOn: "2021-08-30",
    updatedOn: "2026-06-09",
  },
};

const MOCK_GROUP_QUEUE: GroupQueueEntry[] = [
  {
    reports: [
      {
        id: 1,
        reportedBy: { id: "u1", name: "Avi Cohen", joinedDate: "2024-01-10", profilePic: "" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-15",
        description:
          "This group contains inappropriate advertisements and spam content. This group contains inappropriate advertisements and spam content.This group contains inappropriate advertisements and spam content. This group contains inappropriate advertisements and spam content.",
        group: MOCK_GROUPS.g1,
      },
      {
        id: 2,
        reportedBy: { id: "u2", name: "Sarah Levy", joinedDate: "2024-03-12", profilePic: "" },
        reason: ReportCategories.LINK_NOT_WORKING,
        reportedDate: "2026-06-16",
        description: "The invite link for this WhatsApp group has expired and is no longer valid.",
        group: MOCK_GROUPS.g1,
      },
      {
        id: 3,
        reportedBy: { id: "u3", name: "David Goldstein", joinedDate: "2024-05-18" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-17",
        description: "Offensive messages posted in the main channel.",
        group: MOCK_GROUPS.g1,
      },
      {
        id: 4,
        reportedBy: { id: "u4", name: "Rachel Friedman", joinedDate: "2024-06-01" },
        reason: ReportCategories.LINK_NOT_WORKING,
        reportedDate: "2026-06-18",
        description: "",
        group: MOCK_GROUPS.g1,
      },
      {
        id: 5,
        reportedBy: { id: "u5", name: "Michael Berger", joinedDate: "2024-02-28" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-19",
        description: "Repeated advertisements and solicitation messages.",
        group: MOCK_GROUPS.g1,
      },
      {
        id: 6,
        reportedBy: { id: "u6", name: "Leah Stein", joinedDate: "2024-04-02" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-10",
        description: "Group was sharing unrelated promotional content.",
        reviewed: true,
        group: MOCK_GROUPS.g1,
      },
      {
        id: 7,
        reportedBy: { id: "u7", name: "Daniel Katz", joinedDate: "2024-07-22" },
        reason: ReportCategories.LINK_NOT_WORKING,
        reportedDate: "2026-06-11",
        description: "Invite link returned an error when tested.",
        reviewed: true,
        group: MOCK_GROUPS.g1,
      },
    ],
  },
  {
    reports: [
      {
        id: 101,
        reportedBy: { id: "u101", name: "Esther Friedman", joinedDate: "2024-02-14" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-12",
        description: "Listings posted have nothing to do with auto parts or vehicles.",
        group: MOCK_GROUPS.g2,
      },
      {
        id: 102,
        reportedBy: { id: "u102", name: "Dovid Stern", joinedDate: "2024-03-30" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-13",
        description: "An offensive image was dropped in the group yesterday afternoon.",
        group: MOCK_GROUPS.g2,
      },
      {
        id: 103,
        reportedBy: { id: "u103", name: "Chaya Weiss", joinedDate: "2024-01-05" },
        reason: ReportCategories.LINK_NOT_WORKING,
        reportedDate: "2026-06-14",
        description: "Invite link is invalid or has expired. Can't get in at all.",
        group: MOCK_GROUPS.g2,
      },
      {
        id: 104,
        reportedBy: { id: "u104", name: "Avi Roth", joinedDate: "2023-12-22" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-08",
        description: "Resolved after the owner removed the unrelated listings.",
        reviewed: true,
        group: MOCK_GROUPS.g2,
      },
    ],
  },
  {
    reports: [
      {
        id: 201,
        reportedBy: { id: "u201", name: "Mendel Klein", joinedDate: "2024-05-09" },
        reason: ReportCategories.LINK_NOT_WORKING,
        reportedDate: "2026-06-09",
        description: "Tried joining three separate times over two days. The join link is dead.",
        group: MOCK_GROUPS.g3,
      },
      {
        id: 202,
        reportedBy: { id: "u202", name: "Sara Cohen", joinedDate: "2024-06-19" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-07",
        description:
          "There's inappropriate language in the group description that younger members can see.",
        group: MOCK_GROUPS.g3,
      },
      {
        id: 203,
        reportedBy: { id: "u203", name: "Yossi Brandt", joinedDate: "2023-10-02" },
        reason: ReportCategories.INAPPROPRIATE_CONTENT,
        reportedDate: "2026-06-02",
        description: "Owner cleaned up the listings and pinned the group rules.",
        reviewed: true,
        group: MOCK_GROUPS.g3,
      },
      {
        id: 204,
        reportedBy: { id: "u204", name: "Esther Friedman", joinedDate: "2024-01-27" },
        reason: ReportCategories.LINK_NOT_WORKING,
        reportedDate: "2026-05-30",
        description: "Link works again after the owner re-shared it.",
        reviewed: true,
        group: MOCK_GROUPS.g3,
      },
    ],
  },
];

function getQueueIndex(rawId: string) {
  const match = rawId.match(/(\d+)/);
  const number = match ? Number(match[1]) : 1;
  return (Math.max(number, 1) - 1) % MOCK_GROUP_QUEUE.length;
}

const CURRENT_ADMIN_NAME = "John Doe";

const CATEGORY_LABELS: Record<ReportCategories, string> = {
  [ReportCategories.LINK_NOT_WORKING]: "Link not working",
  [ReportCategories.INAPPROPRIATE_CONTENT]: "Inappropriate content",
  [ReportCategories.RESUBMISSION_MESSAGE]: "Resubmission message",
};

const CATEGORY_COLORS: Record<ReportCategories, string> = {
  [ReportCategories.LINK_NOT_WORKING]: "bg-state-warn",
  [ReportCategories.INAPPROPRIATE_CONTENT]: "bg-state-danger",
  [ReportCategories.RESUBMISSION_MESSAGE]: "bg-state-info",
};

export default function Report() {
  const params = useParams<{ report: string }>();
  return <ReportPageContent key={params.report} reportId={params.report} />;
}

function ReportPageContent({ reportId }: { reportId: string }) {
  const { reports } = MOCK_GROUP_QUEUE[getQueueIndex(reportId)];
  const [group, setGroup] = React.useState<Group>(reports[0].group);
  const [suspension, setSuspension] = React.useState<GroupSuspension | null>(null);

  const unreviewedReports = reports.filter((r) => !r.reviewed);
  const totalUnreviewed = unreviewedReports.length;

  const categoryCounts = unreviewedReports.reduce(
    (acc, r) => {
      acc[r.reason] = (acc[r.reason] || 0) + 1;
      return acc;
    },
    {} as Record<ReportCategories, number>,
  );

  const handleSuspend = (data: { reason: string; reasonLabel: string; remark: string }) => {
    setGroup((prev) => ({ ...prev, status: GroupStatus.SUSPENDED }));
    setSuspension({
      reasonLabel: data.reasonLabel,
      remark: data.remark,
      suspendedAt: formatDate(new Date()),
      suspendedBy: CURRENT_ADMIN_NAME,
    });
  };

  const handleRelist = () => {
    setGroup((prev) => ({ ...prev, status: GroupStatus.ACTIVE }));
    setSuspension(null);
  };

  return (
    <div className="flex flex-row gap-4">
      <div className="flex-2 flex-col">
        <GroupNavigation />
        {group.status === GroupStatus.SUSPENDED && suspension && (
          <div>
            <Banner
              variant="warning"
              icon={<AlertTriangle />}
              title={`Suspended on ${suspension.suspendedAt} by ${suspension.suspendedBy}`}
              description={`Reason: ${suspension.reasonLabel}${suspension.remark ? ` ${suspension.remark}` : ""}. Hidden from the directory and search, reports remain open below for the record.`}
              className="mt-4"
            />
          </div>
        )}
        <Card className="my-4">
          <CardContent className="flex items-center gap-4">
            <Typography variant={"h1"} className="text-state-error">
              {totalUnreviewed}
            </Typography>
            <div className="flex flex-col justify-center">
              <Typography variant={"p"} className="text-ink-3 font-medium leading-none">
                Unreviewed
              </Typography>
              <Typography variant={"p"} className="text-ink-3 font-medium leading-none mt-1">
                reports
              </Typography>
            </div>
            <Separator orientation="vertical" className="bg-surface-line mx-4" />
            <div className="flex flex-row items-center gap-6">
              {Object.entries(categoryCounts).map(([reason, count]) => {
                const label = CATEGORY_LABELS[reason as ReportCategories] || reason;
                const colorClass = CATEGORY_COLORS[reason as ReportCategories] || "bg-ink-3";
                return (
                  <div key={reason} className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", colorClass)} />
                    <Typography variant={"p"} className="text-ink-2 text-xs font-medium">
                      <span className="text-ink-1 font-semibold mr-1">{count}</span>
                      {label}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <ReportsListSection initialReports={reports} />
      </div>
      <div className="flex flex-col flex-1 gap-4">
        <GroupDetailsCard group={group} />
        <ActionsCard group={group} onSuspend={handleSuspend} onRelist={handleRelist} />
      </div>
    </div>
  );
}
