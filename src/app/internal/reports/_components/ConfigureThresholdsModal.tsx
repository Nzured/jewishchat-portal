"use client";

import * as React from "react";
import { Flag, Minus, Plus, Save, Unlink, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { NoData } from "@/components/ui/NoData";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { GroupService } from "@/services/group/group.service";
import {
  REPORT_CATEGORY_LABELS,
  ReportCategories,
  ReportThresholds,
  ReportThresholdsResponse,
} from "@/types/Report";

const MIN_THRESHOLD = 1;
const MAX_THRESHOLD = 99;
const DEFAULT_THRESHOLD = 3;

const CONFIGURABLE_CATEGORIES = [
  ReportCategories.INAPPROPRIATE_CONTENT,
  ReportCategories.LINK_NOT_WORKING,
];

const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; className: string }> = {
  [ReportCategories.INAPPROPRIATE_CONTENT]: {
    icon: <Flag className="size-4" />,
    className: "bg-state-bg-error text-state-danger",
  },
  [ReportCategories.LINK_NOT_WORKING]: {
    icon: <Unlink className="size-4" />,
    className: "bg-state-bg-warning text-state-warn",
  },
};

const clamp = (value: number) => Math.min(MAX_THRESHOLD, Math.max(MIN_THRESHOLD, value));

type ThresholdsPayload =
  | ReportThresholdsResponse
  | ReportThresholds
  | { thresholds?: ReportThresholds }
  | null;

function toEntries(source: ThresholdsPayload): [string, unknown][] {
  if (Array.isArray(source)) {
    return source.map((entry) => [entry.category, entry.thresholdValue]);
  }
  if (source && "thresholds" in source && source.thresholds) {
    return Object.entries(source.thresholds);
  }
  return Object.entries((source as ReportThresholds) ?? {});
}

function normalize(source: ThresholdsPayload): Record<string, number> {
  const normalized: Record<string, number> = {};

  toEntries(source).forEach(([category, value]) => {
    if (typeof value === "number" && Number.isFinite(value)) normalized[category] = clamp(value);
  });

  CONFIGURABLE_CATEGORIES.forEach((category) => {
    if (normalized[category] === undefined) normalized[category] = DEFAULT_THRESHOLD;
  });

  return normalized;
}

interface ConfigureThresholdsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigureThresholdsModal({ open, onOpenChange }: ConfigureThresholdsModalProps) {
  const [thresholds, setThresholds] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let ignore = false;

    async function loadThresholds() {
      setLoading(true);
      setFailed(false);
      try {
        const res = await GroupService.getReportThresholds();
        if (ignore) return;
        setThresholds(normalize(res?.data ?? null));
      } catch {
        if (ignore) return;
        setThresholds({});
        setFailed(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadThresholds();

    return () => {
      ignore = true;
    };
  }, [open]);

  const adjust = (category: string, delta: number) =>
    setThresholds((current) => ({
      ...current,
      [category]: clamp((current[category] ?? DEFAULT_THRESHOLD) + delta),
    }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await GroupService.updateReportThresholds({ thresholds });
      toast.success("Report thresholds updated.");
      onOpenChange(false);
    } catch {
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
  };

  const categories = Object.keys(thresholds);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Configure thresholds</ModalTitle>
          <ModalDescription>
            Set how many reports a group can receive in each category before it&apos;s automatically
            suspended.
          </ModalDescription>
        </ModalHeader>

        {!failed && (
          <div className="flex items-center justify-between pb-2">
            <Typography
              variant="muted"
              className="text-[11px] font-medium tracking-wider uppercase"
            >
              Report category
            </Typography>
            <Typography
              variant="muted"
              className="text-[11px] font-medium tracking-wider uppercase"
            >
              Threshold
            </Typography>
          </div>
        )}

        {failed ? (
          <NoData
            title="Couldn't load thresholds"
            description="We couldn't fetch the configured report thresholds. Close this and try again."
          />
        ) : (
          <div className="divide-y divide-surface-line border-t border-surface-line">
            {loading
              ? CONFIGURABLE_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-lg" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                ))
              : categories.map((category) => {
                  const meta = CATEGORY_ICONS[category];
                  const label = REPORT_CATEGORY_LABELS[category as ReportCategories] ?? category;
                  const value = thresholds[category];

                  return (
                    <div key={category} className="flex items-center justify-between gap-3 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            meta?.className ?? "bg-surface-bg text-ink-3",
                          )}
                        >
                          {meta?.icon ?? <Flag className="size-4" />}
                        </div>
                        <Typography variant="small" className="font-medium text-ink-1">
                          {label}
                        </Typography>
                      </div>

                      <div className="flex items-center overflow-hidden rounded-lg border border-surface-line">
                        <button
                          type="button"
                          onClick={() => adjust(category, -1)}
                          disabled={value <= MIN_THRESHOLD}
                          aria-label={`Decrease ${label} threshold`}
                          className="flex size-8 cursor-pointer items-center justify-center text-ink-3 transition-colors hover:bg-surface-bg hover:text-ink-1 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Minus className="size-4" />
                        </button>
                        <Typography
                          variant="small"
                          className="min-w-9 text-center font-semibold tabular-nums text-ink-1"
                        >
                          {value}
                        </Typography>
                        <button
                          type="button"
                          onClick={() => adjust(category, 1)}
                          disabled={value >= MAX_THRESHOLD}
                          aria-label={`Increase ${label} threshold`}
                          className="flex size-8 cursor-pointer items-center justify-center text-ink-3 transition-colors hover:bg-surface-bg hover:text-ink-1 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>
        )}

        <ModalFooter>
          <Button
            leftIcon={<X />}
            variant="secondary"
            color="primary"
            className="text-ink-2 hover:bg-surface-bg"
            onClick={() => onOpenChange(false)}
          >
            {failed ? "Close" : "Cancel"}
          </Button>
          {!failed && (
            <Button
              leftIcon={<Save />}
              onClick={() => void handleSave()}
              disabled={loading || isSaving || categories.length === 0}
            >
              Save Changes
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
