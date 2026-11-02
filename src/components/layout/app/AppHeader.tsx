"use client";

import { ReactNode, useEffect, useRef } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Fab } from "@/components/ui/Fab";
import { SearchFilterChip } from "@/components/ui/SearchFilterChip";
import { Typography } from "@/components/ui/Typography";
import { singularize } from "@/configs/functions/WordFormatter";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { cn } from "@/lib/utils";
import { FilterItem } from "@/types/Search";

export const APP_TOOLBAR_HEIGHT_VAR = "--app-toolbar-height";

interface AppHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  count?: number;
  countLabel?: string;
  onAddNew?: () => void;
  filters?: FilterItem[];
  onButtonPress?: () => void;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

function useStickyToolbar(enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const toolbar = toolbarRef.current;
    if (!enabled || !sentinel || !toolbar) return;

    const scroller = toolbar.closest("main");
    const stuckObserver = new IntersectionObserver(
      ([entry]) => {
        const rootTop = entry.rootBounds?.top ?? 0;
        toolbar.classList.toggle(
          "is-stuck",
          !entry.isIntersecting && entry.boundingClientRect.top < rootTop,
        );
      },
      { root: scroller, threshold: 0 },
    );
    stuckObserver.observe(sentinel);

    const sizeObserver = new ResizeObserver(() => {
      const height = window.matchMedia("(min-width: 768px)").matches ? toolbar.offsetHeight : 0;
      scroller?.style.setProperty(APP_TOOLBAR_HEIGHT_VAR, `${height}px`);
    });
    sizeObserver.observe(toolbar);

    return () => {
      stuckObserver.disconnect();
      sizeObserver.disconnect();
      scroller?.style.removeProperty(APP_TOOLBAR_HEIGHT_VAR);
    };
  }, [enabled]);

  return { sentinelRef, toolbarRef };
}

export default function AppHeader({
  title,
  subtitle,
  count,
  countLabel = "records",
  filters,
  onButtonPress,
  buttonLabel = "Add New",
  buttonIcon,
  toolbar,
  className,
}: AppHeaderProps) {
  const { appliedFilters, applyFilterValue, clearFilter } = useSearchFilter();
  const hasFilters = Boolean(filters?.length);
  const hasToolbar = Boolean(toolbar || hasFilters || onButtonPress);
  const { sentinelRef, toolbarRef } = useStickyToolbar(hasToolbar);

  return (
    <>
      <div className={cn("flex flex-col gap-2 pt-8 pb-4", className)}>
        <div className="flex items-center gap-6">
          <Typography variant="h2" className="font-semibold text-color-ink-1">
            {title}
          </Typography>
          {count !== undefined && count !== 0 ? (
            <Chip
              className="mt-1"
              variant="count"
              count={count}
              label={count === 1 ? singularize(countLabel) : countLabel}
              shape="pill"
            />
          ) : null}
        </div>
        {subtitle && (
          <Typography variant="p" className="text-ink-3">
            {subtitle}
          </Typography>
        )}
      </div>

      {hasToolbar && (
        <>
          <div ref={sentinelRef} aria-hidden className="h-px" />
          <div
            ref={toolbarRef}
            data-slot="app-header-toolbar"
            className={cn(
              "static z-20 -mx-6 -mt-px flex flex-wrap items-center justify-between gap-3 border-b border-transparent bg-surface-bg px-6 py-3 md:sticky md:top-0",
              "transition-[border-color,box-shadow] duration-200 [&.is-stuck]:border-surface-line [&.is-stuck]:shadow-[0_6px_16px_-12px_color-mix(in_oklab,var(--color-ink-1)_35%,transparent)]",
            )}
          >
            <div className="flex w-full min-w-0 flex-wrap items-center gap-3 md:w-auto">
              {toolbar}
              {hasFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  {filters?.map((filter) => (
                    <SearchFilterChip
                      key={filter.key}
                      filter={filter}
                      appliedFilter={appliedFilters.find((item) => item.key === filter.key)}
                      onApply={(value) => applyFilterValue(filter.key, value)}
                      onClear={() => clearFilter(filter.key)}
                    />
                  ))}
                </div>
              )}
            </div>
            {onButtonPress && (
              <Button
                variant="default"
                onClick={onButtonPress}
                leftIcon={buttonIcon ?? <PlusCircle className="size-4" />}
                className="ml-auto hidden justify-center md:inline-flex"
              >
                {buttonLabel}
              </Button>
            )}
          </div>
        </>
      )}

      {onButtonPress && (
        <Fab
          icon={buttonIcon ?? <PlusCircle className="size-6" />}
          onClick={onButtonPress}
          aria-label={buttonLabel}
        />
      )}
    </>
  );
}
