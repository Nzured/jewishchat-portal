"use client";

import { ReactNode } from "react";
import { PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { SearchDropdown } from "@/components/ui/SearchDropdown";
import { Typography } from "@/components/ui/Typography";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import { formatDate, parseDateKey, toDateKey } from "@/lib/date";
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
}

function formatRangeBound(value?: string) {
  if (!value) return null;
  const num = Number(value);
  return Number.isNaN(num) ? value : num.toLocaleString();
}

function formatDateBound(value?: string) {
  return value ? formatDate(parseDateKey(value)) : null;
}

function getFilterValueLabel(filter?: FilterItem) {
  if (!filter || filter.value == null || filter.value === "") return null;

  if (filter.component === "NUMBER_RANGE" || filter.component === "DATE_RANGE") {
    const isDateRange = filter.component === "DATE_RANGE";
    const [start, end] = Array.isArray(filter.value) ? filter.value : [filter.value, ""];
    const startLabel = isDateRange ? formatDateBound(start) : formatRangeBound(start);
    const endLabel = isDateRange ? formatDateBound(end) : formatRangeBound(end);
    if (!startLabel && !endLabel) return null;
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
    if (isDateRange) return startLabel ? `From ${startLabel}` : `Until ${endLabel}`;
    return startLabel ? `≥ ${startLabel}` : `≤ ${endLabel}`;
  }

  const values = Array.isArray(filter.value) ? filter.value : [filter.value];
  return values
    .map((value) => filter.options?.find((opt) => opt.value === value)?.label ?? value)
    .join(", ");
}

export default function AppHeader({
  title,
  subtitle,
  count,
  countLabel = "records",
  filters,
  onButtonPress,
  buttonLabel = "Add New",
}: AppHeaderProps) {
  const { appliedFilters, updateFilterValue, updateSearchValue, applyFilters, clearFilter } =
    useSearchFilter();

  return (
    <>
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
                label={countLabel}
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
          <Button
            variant="default"
            onClick={onButtonPress}
            leftIcon={<PlusCircle className="size-4" />}
            className="justify-center"
          >
            {buttonLabel}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {filters?.map((filter) => {
          const appliedValueLabel = getFilterValueLabel(
            appliedFilters.find((item) => item.key === filter.key),
          );
          const [rangeStart, rangeEnd] =
            filter.component === "NUMBER_RANGE" || filter.component === "DATE_RANGE"
              ? Array.isArray(filter.value)
                ? filter.value
                : ["", ""]
              : ["", ""];

          return (
            <Popover key={filter.key}>
              <PopoverTrigger asChild>
                {appliedValueLabel ? (
                  <Chip
                    shape="rounded"
                    label={
                      <>
                        <Typography variant={"small"} className="font-normal text-brand-deep">
                          {filter.label} :
                        </Typography>{" "}
                        <Typography variant={"small"} className="font-semibold text-brand-deep">
                          {appliedValueLabel}
                        </Typography>
                      </>
                    }
                    rightIcon={<X className="size-2.5" />}
                    rightIconLabel={`Clear ${filter.label} filter`}
                    onRightIconClick={() => clearFilter(filter.key)}
                    className="border-state-success/20 bg-brand-soft text-state-success"
                  />
                ) : (
                  <Chip
                    label={filter.label}
                    shape="rounded"
                    type={"neutral"}
                    leftIcon={<PlusCircle className="text-ink-3" />}
                  />
                )}
              </PopoverTrigger>
              <PopoverContent className="mt-2">
                <PopoverHeader>
                  <PopoverTitle>{`Filter by : ${filter.label}`}</PopoverTitle>
                </PopoverHeader>
                <div className="flex flex-row items-center gap-4">
                  <PopoverDescription>
                    {filter.component === "NUMBER_RANGE" || filter.component === "DATE_RANGE"
                      ? "between"
                      : "contains"}
                  </PopoverDescription>
                  {filter.component === "AUTOSELECT" || filter.component === "DROPDOWN" ? (
                    <SearchDropdown
                      items={(filter.options || []).filter((opt) =>
                        opt.label.toLowerCase().includes((filter.searchValue || "").toLowerCase()),
                      )}
                      placeholder={"Search by " + filter.label}
                      searchValue={filter.searchValue || ""}
                      onSearchValueChange={(val) => updateSearchValue(filter.key, val)}
                      value={filter.value as string | null}
                      onValueChange={(val) => updateFilterValue(filter.key, val)}
                    />
                  ) : filter.component === "TEXT_INPUT" ? (
                    <Input
                      type="text"
                      placeholder={"Enter " + filter.label}
                      value={(filter.value as string) || ""}
                      onChange={(e) => updateFilterValue(filter.key, e.target.value)}
                    />
                  ) : filter.component === "NUMBER_INPUT" ? (
                    <Input
                      type="number"
                      placeholder={"Enter " + filter.label}
                      value={(filter.value as string) || ""}
                      onChange={(e) => updateFilterValue(filter.key, e.target.value)}
                    />
                  ) : filter.component === "NUMBER_RANGE" ? (
                    <div className="flex w-full items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={rangeStart || ""}
                        onChange={(e) => updateFilterValue(filter.key, [e.target.value, rangeEnd])}
                      />
                      <Typography variant={"small"} className="shrink-0 text-ink-3">
                        to
                      </Typography>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={rangeEnd || ""}
                        onChange={(e) =>
                          updateFilterValue(filter.key, [rangeStart, e.target.value])
                        }
                      />
                    </div>
                  ) : filter.component === "DATE_RANGE" ? (
                    <div className="flex w-full items-center gap-2">
                      <DatePicker
                        value={rangeStart ? parseDateKey(rangeStart) : undefined}
                        onChange={(date) =>
                          updateFilterValue(filter.key, [date ? toDateKey(date) : "", rangeEnd])
                        }
                        placeholder="From"
                        align="start"
                      />
                      <Typography variant={"small"} className="shrink-0 text-ink-3">
                        to
                      </Typography>
                      <DatePicker
                        value={rangeEnd ? parseDateKey(rangeEnd) : undefined}
                        onChange={(date) =>
                          updateFilterValue(filter.key, [rangeStart, date ? toDateKey(date) : ""])
                        }
                        placeholder="To"
                        align="end"
                      />
                    </div>
                  ) : null}
                </div>
                <PopoverClose asChild>
                  <Button className="mt-2" variant="default" onClick={applyFilters}>
                    Apply Filter
                  </Button>
                </PopoverClose>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </>
  );
}
