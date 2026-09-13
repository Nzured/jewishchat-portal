import { Layers, Users } from "lucide-react";
import { NOT_APPLICABLE } from "@/configs/const";
import { GrowthSnapshot as GrowthSnapshotStats } from "@/types/Dashboard";
import { formatCount } from "./format";
import { SectionBadge, SectionHeader } from "./SectionHeader";
import { StatTile, type StatTileProps } from "./StatTile";

interface GrowthSnapshotProps {
  data?: GrowthSnapshotStats;
  publishedInPeriod?: number;
  periodLabel?: string;
  loading?: boolean;
}

export function GrowthSnapshot({
  data,
  publishedInPeriod,
  periodLabel,
  loading = false,
}: GrowthSnapshotProps) {
  const totalCategories = data?.liveGroupsByCategory?.length;
  const emptyCategories =
    totalCategories !== undefined && data?.categoriesWithLiveGroups != null
      ? totalCategories - data.categoriesWithLiveGroups
      : undefined;

  const tiles: StatTileProps[] = [
    {
      label: "Total live groups",
      value: formatCount(data?.totalLiveGroups),
      icon: <Users />,
      tone: "success",
      hint:
        publishedInPeriod != null && periodLabel
          ? `+${formatCount(publishedInPeriod)} ${periodLabel}`
          : undefined,
      hintTone: "muted",
    },
    {
      label: "Total registered users",
      value: formatCount(data?.totalRegisteredUsers),
      icon: <Users />,
      tone: "success",
      hint: data
        ? `${formatCount(data.groupOwners)} owners · ${formatCount(data.members)} members`
        : undefined,
      hintTone: "muted",
    },
    {
      label: "Categories with live groups",
      value:
        totalCategories !== undefined && data?.categoriesWithLiveGroups != null
          ? `${data.categoriesWithLiveGroups} of ${totalCategories}`
          : NOT_APPLICABLE,
      icon: <Layers />,
      tone: "success",
      hint:
        emptyCategories !== undefined
          ? emptyCategories === 0
            ? "All categories have live groups"
            : `${emptyCategories} ${emptyCategories === 1 ? "category" : "categories"} still empty`
          : undefined,
      hintTone: "muted",
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Growth snapshot"
        subtitle="Live totals across the directory."
        badge={<SectionBadge>Current</SectionBadge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} loading={loading} />
        ))}
      </div>
    </section>
  );
}
