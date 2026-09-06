"use client";

import * as React from "react";
import { ExternalLink, MapPin, Pencil } from "lucide-react";
import NextLink from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { NoData } from "@/components/ui/NoData";
import { Progress } from "@/components/ui/Progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, EXTERNAL_GROUPS_NEW_PATH } from "@/configs/const";
import { useUser } from "@/contexts/UserContext";
import { timeAgo } from "@/lib/date";
import { formatLocation } from "@/lib/location";
import { getGroupPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { GroupService } from "@/services/group/group.service";
import { Group, GroupDraft, GroupDraftStep1Payload, GroupStatus } from "@/types/Group";

type ProfileGroupsTab = "published" | "drafts";

const TOTAL_DRAFT_STEPS = 4;
const SKELETON_COUNT = 4;

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const STATUS_LABELS: Partial<Record<GroupStatus, string>> = {
  [GroupStatus.ACTIVE]: "Published",
  [GroupStatus.SUSPENDED]: "Suspended",
  [GroupStatus.PENDING]: "Pending",
  [GroupStatus.PENDING_MODERATION]: "In review",
  [GroupStatus.MANUAL_REVIEW]: "In review",
};

const STATUS_CHIP_TYPE: Partial<Record<GroupStatus, "neutral" | "error" | "warning" | "success">> =
  {
    [GroupStatus.ACTIVE]: "success",
    [GroupStatus.SUSPENDED]: "error",
    [GroupStatus.PENDING]: "warning",
    [GroupStatus.PENDING_MODERATION]: "warning",
    [GroupStatus.MANUAL_REVIEW]: "warning",
  };

interface ProfileGroupsProps {
  userUuid?: string;
  onEditGroup?: (group: Group) => void;
  className?: string;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <Typography variant="tiny" className="font-mono tracking-[1.1px] text-ink-4 uppercase">
        {label}
      </Typography>
      <Typography variant="large" className="tabular-nums text-ink-1">
        {compactNumber.format(value ?? 0)}
      </Typography>
    </div>
  );
}

function GroupCard({
  group,
  canEdit,
  onEdit,
}: {
  group: Group;
  canEdit: boolean;
  onEdit?: (group: Group) => void;
}) {
  const location = formatLocation(group, ["city", "state"]);
  const groupPath = getGroupPath(group);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-line bg-surface-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar variant="tile" src={group.thumbnailUrl ?? undefined} name={group.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography variant="small" className="truncate font-semibold text-ink-1">
            {group.name}
          </Typography>
          {location && (
            <div className="flex items-center gap-1 text-ink-3">
              <MapPin className="size-3 shrink-0" />
              <Typography variant="tiny" className="truncate text-ink-3">
                {location}
              </Typography>
            </div>
          )}
        </div>
        <Chip
          shape="pill"
          type={STATUS_CHIP_TYPE[group.status] ?? "neutral"}
          label={STATUS_LABELS[group.status] ?? group.status}
        />
      </div>

      {group.shortDesc && (
        <Typography variant="small" className="text-ink-3" clampLines={2}>
          {group.shortDesc}
        </Typography>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {group.mainCategory?.name && (
          <Chip shape="pill" type="neutral" label={group.mainCategory.name} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-surface-line pt-3 sm:grid-cols-4">
        <Stat label="Total views" value={group.totalViews} />
        <Stat label="Unique views" value={group.uniqueViews} />
        <Stat label="Total clicks" value={group.totalJoinClicks} />
        <Stat label="Unique clicks" value={group.uniqueJoinClicks} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-surface-line pt-3">
        {canEdit && onEdit && (
          <Button variant="outline" size="sm" leftIcon={<Pencil />} onClick={() => onEdit(group)}>
            Edit details
          </Button>
        )}
        <Button variant="link" size="sm" rightIcon={<ExternalLink />} asChild>
          <NextLink href={groupPath}>View public page</NextLink>
        </Button>
      </div>
    </div>
  );
}

function parseStep1(data?: string): GroupDraftStep1Payload | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as GroupDraftStep1Payload;
  } catch {
    return null;
  }
}

function DraftCard({ draft }: { draft: GroupDraft }) {
  const step1 = parseStep1(draft.step1Data);
  const completedSteps = (draft.step1Data ? 1 : 0) + (draft.step2Data ? 1 : 0);
  const currentStep = Math.min(completedSteps + 1, TOTAL_DRAFT_STEPS);
  const name = step1?.name || "Untitled group";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-surface-line bg-state-bg-success/40 p-4">
      <div className="flex items-center gap-3">
        <Avatar variant="tile" name={name} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography variant="small" className="truncate font-semibold text-ink-1">
            {name}
          </Typography>
          <Typography variant="tiny" className="text-ink-3">
            Step {currentStep} of {TOTAL_DRAFT_STEPS} &middot; last edited{" "}
            {timeAgo(draft.lastUpdatedAt)}
          </Typography>
        </div>
      </div>
      <Progress value={completedSteps} max={TOTAL_DRAFT_STEPS} className="h-1" />
      <div className="flex items-center">
        <Button variant="outline" size="sm" leftIcon={<Pencil />} asChild>
          <NextLink href={`${EXTERNAL_GROUPS_NEW_PATH}?draftId=${draft.draftId}`}>
            Continue draft
          </NextLink>
        </Button>
      </div>
    </div>
  );
}

export default function ProfileGroups({ userUuid, onEditGroup, className }: ProfileGroupsProps) {
  const { user } = useUser();
  const isOwnProfile = Boolean(userUuid) && userUuid === user?.uuid;

  const [groups, setGroups] = React.useState<Group[]>([]);
  const [drafts, setDrafts] = React.useState<GroupDraft[]>([]);
  const [totalPages, setTotalPages] = React.useState(0);
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<ProfileGroupsTab>("published");

  React.useEffect(() => {
    if (!userUuid) return;
    let ignore = false;

    const request = isOwnProfile
      ? GroupService.getMyGroups(page, DEFAULT_PAGE_SIZE)
      : GroupService.getGroupsBySubmitter(userUuid, page, DEFAULT_PAGE_SIZE);

    request
      .then((res) => {
        if (ignore) return;
        const incoming = res?.data?.groups ?? [];
        setGroups((prev) => {
          if (page === DEFAULT_PAGE) return incoming;
          const seen = new Set(prev.map((group) => group.uuid));
          return [...prev, ...incoming.filter((group) => !seen.has(group.uuid))];
        });
        setDrafts(isOwnProfile && "drafts" in res.data ? (res.data.drafts ?? []) : []);
        setTotalPages(res?.data?.totalPages ?? 0);
      })
      .catch(() => {
        if (ignore) return;
        setGroups([]);
        setDrafts([]);
        setTotalPages(0);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userUuid, isOwnProfile, page]);

  const showDrafts = isOwnProfile && activeTab === "drafts";
  const visibleGroups = showDrafts ? [] : groups;
  const hasMore = page + 1 < totalPages;

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-1">
        <Typography
          variant="tiny"
          className="font-mono tracking-[1.6px] text-brand-green uppercase"
        >
          {isOwnProfile ? "My groups" : "Groups"}
        </Typography>
        <Typography variant="h2" className="font-display font-bold">
          {isOwnProfile ? "Everything you've added, in one place." : "Groups added by this member"}
        </Typography>
        <Typography variant="muted" className="max-w-md">
          {isOwnProfile
            ? "Published listings, anything currently suspended, and drafts you haven't finished - all live here."
            : "Published listings this member has added to the directory."}
        </Typography>
      </div>

      {isOwnProfile && (
        <div className="flex flex-wrap gap-2">
          <Chip
            shape="pill"
            label={`Published (${groups.length})`}
            type={activeTab === "published" ? "selected" : "neutral"}
            onClick={() => setActiveTab("published")}
          />
          <Chip
            shape="pill"
            label={`Drafts (${drafts.length})`}
            type={activeTab === "drafts" ? "selected" : "neutral"}
            onClick={() => setActiveTab("drafts")}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : showDrafts ? (
        drafts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {drafts.map((draft) => (
              <DraftCard key={draft.draftId} draft={draft} />
            ))}
          </div>
        ) : (
          <NoData title="No drafts" description="You have no unfinished group drafts." />
        )
      ) : visibleGroups.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleGroups.map((group) => (
              <GroupCard
                key={group.uuid}
                group={group}
                canEdit={isOwnProfile}
                onEdit={onEditGroup}
              />
            ))}
          </div>
          {hasMore && (
            <Button
              variant="outline"
              size="sm"
              className="self-center"
              onClick={() => setPage((prev) => prev + 1)}
            >
              Load more
            </Button>
          )}
        </>
      ) : (
        <NoData
          title="No groups yet"
          description={
            isOwnProfile
              ? "Groups you add to the directory will show up here."
              : "This member hasn't published any groups yet."
          }
        />
      )}
    </section>
  );
}
