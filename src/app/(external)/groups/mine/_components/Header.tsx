"use client";

import { Plus } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_NEW_PATH } from "@/configs/const";

export type MyGroupsTab = "groups" | "draft";

interface HeaderProps {
  activeTab: MyGroupsTab;
  onTabChange: (tab: MyGroupsTab) => void;
  groupCount?: number;
  draftCount?: number;
}

export default function Header({
  activeTab,
  onTabChange,
  groupCount = 0,
  draftCount = 0,
}: HeaderProps) {
  return (
    <div className="relative overflow-hidden items-center">
      <div className="flex items-center justify-between gap-4">
        <Typography variant="h1" className="text-ink-1 font-display font-bold">
          My Groups
        </Typography>
        <Button asChild leftIcon={<Plus className="size-4" />}>
          <NextLink href={EXTERNAL_GROUPS_NEW_PATH}>Add Group</NextLink>
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip
          shape="pill"
          label={`Groups (${groupCount})`}
          type={activeTab === "groups" ? "selected" : "neutral"}
          onClick={() => {
            onTabChange("groups");
          }}
        />
        <Chip
          shape="pill"
          label={`Draft (${draftCount})`}
          type={activeTab === "draft" ? "selected" : "neutral"}
          onClick={() => {
            onTabChange("draft");
          }}
        />
      </div>
    </div>
  );
}
