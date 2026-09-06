"use client";

import { Link2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { formatLocation } from "@/lib/location";
import { Group } from "@/types/Group";
import { SectionLabel } from "./SectionLabel";

interface GroupOverviewCardProps {
  group: Group | null;
  loading?: boolean;
}

export default function GroupOverviewCard({ group, loading }: GroupOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <SectionLabel>Overview</SectionLabel>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </>
        ) : !group ? (
          <Typography variant="small" className="text-ink-3">
            Nothing to show.
          </Typography>
        ) : (
          <>
            {group.shortDesc && (
              <Typography variant="small" className="text-ink-1">
                {group.shortDesc}
              </Typography>
            )}

            {group.about && (
              <Typography variant="small" className="text-ink-3" clampLines={4}>
                {group.about}
              </Typography>
            )}

            {group.whatsappLink && (
              <a
                href={group.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit min-w-0 items-center gap-2 text-brand-green hover:underline"
              >
                <Link2 className="size-4 shrink-0" />
                <Typography variant="tiny" className="truncate font-mono text-inherit">
                  {group.whatsappLink.replace(/^https?:\/\//, "")}
                </Typography>
              </a>
            )}

            {formatLocation(group) && (
              <div className="flex items-center gap-2 text-ink-3">
                <MapPin className="size-4 shrink-0" />
                <Typography variant="small" className="text-ink-3">
                  {formatLocation(group)}
                </Typography>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
