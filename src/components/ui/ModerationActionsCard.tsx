"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/Drawer";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

export interface ModerationAction {
  key: string;
  /** Fully configured element (icon, label, variant, color, onClick, etc. all live here). */
  node: React.ReactElement<{ className?: string; onClick?: (event: React.MouseEvent) => void }>;
  /** Pins this action to the mobile bottom bar; the rest fall into the "More actions" drawer. */
  primary?: boolean;
  hidden?: boolean;
}

export interface ModerationActionSeparator {
  key: string;
  type: "separator";
  hidden?: boolean;
}

export type ModerationActionItem = ModerationAction | ModerationActionSeparator;

interface ModerationActionsCardProps {
  title?: React.ReactNode;
  actions: ModerationActionItem[];
  loading?: boolean;
  skeletonCount?: number;
  cardSize?: "default" | "sm";
  contentClassName?: string;
}

function isSeparator(item: ModerationActionItem): item is ModerationActionSeparator {
  return "type" in item && item.type === "separator";
}

export function ModerationActionsCard({
  title = "MODERATIONS",
  actions,
  loading = false,
  skeletonCount = 4,
  cardSize = "default",
  contentClassName,
}: ModerationActionsCardProps) {
  const [moreDrawerOpen, setMoreDrawerOpen] = React.useState(false);

  const visible = actions.filter((item) => !item.hidden);
  const visibleActions = visible.filter((item): item is ModerationAction => !isSeparator(item));
  const primaryAction = visibleActions.find((item) => item.primary) ?? visibleActions[0];
  const secondaryActions = visibleActions.filter((item) => item !== primaryAction);

  return (
    <>
      <div className="hidden md:block">
        <Card size={cardSize}>
          {title && (
            <CardHeader>
              <Typography
                variant="tiny"
                className="font-mono font-medium tracking-[1.6px] text-ink-3"
              >
                {title}
              </Typography>
            </CardHeader>
          )}
          <CardContent className={cn("flex flex-col gap-2 pt-0", contentClassName)}>
            {loading
              ? Array.from({ length: skeletonCount }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full rounded-xl" />
                ))
              : visible.map((item) =>
                  isSeparator(item) ? (
                    <Separator key={item.key} className="my-1" />
                  ) : (
                    <React.Fragment key={item.key}>{item.node}</React.Fragment>
                  ),
                )}
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-surface-line bg-surface-card p-3 md:hidden">
        {loading ? (
          <>
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="size-10 shrink-0 rounded-xl" />
          </>
        ) : (
          primaryAction && (
            <>
              {React.cloneElement(primaryAction.node, {
                className: cn("flex-1", primaryAction.node.props.className),
              })}
              {secondaryActions.length > 0 && (
                <Button
                  size="icon"
                  variant="secondary"
                  color="primary"
                  aria-label="More actions"
                  onClick={() => setMoreDrawerOpen(true)}
                >
                  <MoreVertical className="size-4" />
                </Button>
              )}
            </>
          )
        )}
      </div>

      <Drawer open={moreDrawerOpen} onOpenChange={setMoreDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>More actions</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-2 px-4 pb-6">
            {secondaryActions.map((item) =>
              React.cloneElement(item.node, {
                key: item.key,
                className: cn("justify-start", item.node.props.className),
                onClick: (event: React.MouseEvent) => {
                  setMoreDrawerOpen(false);
                  item.node.props.onClick?.(event);
                },
              }),
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
