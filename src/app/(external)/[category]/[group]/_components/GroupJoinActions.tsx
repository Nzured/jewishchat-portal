"use client";

import * as React from "react";
import { ExternalLink, LogIn, Pencil, Share2 } from "lucide-react";
import NextLink from "next/link";
import { toast } from "sonner";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useUser } from "@/contexts/UserContext";
import { useJoinGroup } from "@/hooks/useJoinGroup";
import { getGroupEditPath } from "@/lib/publicPaths";
import { cn } from "@/lib/utils";
import { Group, GroupStatus } from "@/types/Group";

export function GroupJoinActions({ group, className }: { group: Group; className?: string }) {
  const { user, isLoading } = useUser();
  const { join, isJoining } = useJoinGroup(group.slug);
  const linkLocked = group.linkVisibilityLoggedInOnly && !user;
  const isOwner = Boolean(group.isOwnGroup || (user && user.uuid === group.submittedByUuid));
  const canJoin = !isOwner && group.status === GroupStatus.ACTIVE;

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: group.name, text: group.shortDesc, url });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  if (isLoading && group.linkVisibilityLoggedInOnly) return null;

  if (linkLocked) {
    return (
      <Banner
        className={className}
        icon={<LogIn />}
        variant="warning"
        title="Login to view the join link"
        description="The owner has made this link available to logged in members only."
      >
        <Button size="sm" asChild>
          <NextLink href="/login">Login</NextLink>
        </Button>
        <Button size="sm" variant="secondary" color="primary" asChild>
          <NextLink href="/signup">Create an Account</NextLink>
        </Button>
      </Banner>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-row flex-wrap items-center gap-3">
        {canJoin && (
          <Button
            color="primary"
            leftIcon={<ExternalLink />}
            className="bg-brand-deep hover:bg-brand-deep/90"
            disabled={isJoining}
            onClick={() => void join()}
          >
            {isJoining ? "Opening WhatsApp..." : "Join group on WhatsApp"}
          </Button>
        )}

        <Button variant="outline" leftIcon={<Share2 />} onClick={() => void handleShare()}>
          Share
        </Button>

        {isOwner && (
          <Button variant="outline" leftIcon={<Pencil />} asChild>
            <NextLink href={getGroupEditPath(group)}>Edit listing</NextLink>
          </Button>
        )}
      </div>

      {canJoin && (
        <Typography variant="xs" className="text-ink-4">
          Free to join &middot; opens in WhatsApp
        </Typography>
      )}
    </div>
  );
}
