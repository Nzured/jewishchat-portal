"use client";

import { ReactNode } from "react";
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
  stickyTop?: string;
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
  stickyTop = "top-0",
}: AppHeaderProps) {
  const { appliedFilters, applyFilterValue, clearFilter } = useSearchFilter();

  return (
    <div
      className={cn(
        "static z-20 -mx-6 bg-surface-bg px-6 pb-4 md:sticky",
        stickyTop === "top-0" ? "pt-8" : "pt-4",
        stickyTop,
      )}
    >
      <div className="flex justify-between gap-6 items-center">
        <div className="flex flex-col gap-2">
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
        {onButtonPress && (
          <>
            <Button
              variant="default"
              onClick={onButtonPress}
              leftIcon={buttonIcon ?? <PlusCircle className="size-4" />}
              className="hidden justify-center md:inline-flex"
            >
              {buttonLabel}
            </Button>
            <Fab
              icon={buttonIcon ?? <PlusCircle className="size-6" />}
              onClick={onButtonPress}
              aria-label={buttonLabel}
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
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
    </div>
  );
}
