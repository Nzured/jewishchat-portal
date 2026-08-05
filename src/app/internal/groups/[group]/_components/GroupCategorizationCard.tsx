"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { Category } from "@/types/Category";
import { Group } from "@/types/Group";
import { SectionLabel } from "./SectionLabel";

/** Main category first, then the rest, with duplicates dropped. */
function collectCategories(group: Group): Category[] {
  const all = [group.mainCategory, ...(group.categories ?? [])].filter(Boolean);
  const seen = new Set<number>();

  return all.filter((category) => {
    if (seen.has(category.id)) return false;
    seen.add(category.id);
    return true;
  });
}

interface GroupCategorizationCardProps {
  group: Group | null;
  loading?: boolean;
}

export default function GroupCategorizationCard({ group, loading }: GroupCategorizationCardProps) {
  const categories = group ? collectCategories(group) : [];

  return (
    <Card>
      <CardHeader>
        <SectionLabel>Categorization</SectionLabel>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {loading ? (
          <>
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </>
        ) : categories.length === 0 ? (
          <Typography variant="small" className="text-ink-3">
            No categories assigned.
          </Typography>
        ) : (
          categories.map((category, index) => (
            <Chip
              key={category.id}
              label={category.name}
              shape="pill"
              // The main category leads and is the only one tinted.
              type={index === 0 ? "info" : "neutral"}
              className="max-w-full min-w-0 shrink"
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
