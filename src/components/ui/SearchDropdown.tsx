"use client";

import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SearchDropdownItem {
  label: string;
  value: string;
  disabled?: boolean;
}

type SearchDropdownRootProps = Pick<
  React.ComponentProps<typeof Combobox.Root>,
  "open" | "defaultOpen" | "onOpenChange" | "required" | "readOnly" | "form" | "autoComplete"
>;

type SearchDropdownInputProps = Omit<
  React.ComponentProps<typeof Combobox.Input>,
  | keyof SearchDropdownRootProps
  | "id"
  | "name"
  | "disabled"
  | "value"
  | "defaultValue"
  | "children"
  | "placeholder"
  | "className"
>;

interface SearchDropdownSharedProps extends SearchDropdownRootProps, SearchDropdownInputProps {
  items: SearchDropdownItem[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
}

interface SearchDropdownSingleProps extends SearchDropdownSharedProps {
  multiple?: false;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
}

interface SearchDropdownMultipleProps extends SearchDropdownSharedProps {
  multiple: true;
  value?: string[];
  onValueChange?: (value: string[]) => void;
}

type SearchDropdownProps = SearchDropdownSingleProps | SearchDropdownMultipleProps;

const triggerButtonClassName = "group-has-data-[slot=search-dropdown-clear]:hidden";

function SearchDropdown({
  items,
  placeholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
  id,
  name,
  searchValue,
  onSearchValueChange,
  multiple = false,
  value,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  required,
  readOnly,
  form,
  autoComplete,
  ...inputProps
}: SearchDropdownProps) {
  const chipsAnchorRef = React.useRef<HTMLDivElement>(null);

  const itemsByValue = React.useMemo(
    () => new Map(items.map((item) => [item.value, item])),
    [items],
  );

  const itemToStringLabel = React.useCallback(
    (itemValue: string) => itemsByValue.get(itemValue)?.label ?? "",
    [itemsByValue],
  );

  const selectedValues = multiple ? ((value as string[]) ?? []) : [];

  return (
    <Combobox.Root
      items={items}
      filter={null}
      itemToStringLabel={itemToStringLabel}
      multiple={multiple}
      value={value}
      onValueChange={onValueChange as never}
      inputValue={searchValue}
      onInputValueChange={onSearchValueChange}
      disabled={disabled}
      id={id}
      name={name}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      required={required}
      readOnly={readOnly}
      form={form}
      autoComplete={autoComplete}
    >
      {multiple ? (
        <Combobox.Chips
          ref={chipsAnchorRef}
          data-slot="search-dropdown-chips"
          className={cn(
            "flex min-h-[46px] w-full flex-wrap items-center gap-1.5 rounded-[12px] border border-surface-line bg-surface-card px-3 py-2 transition-colors focus-within:border-brand-green has-aria-invalid:border-state-danger",
            className,
          )}
        >
          {selectedValues.map((itemValue) => (
            <Combobox.Chip
              key={itemValue}
              data-slot="search-dropdown-chip"
              className="flex h-6 items-center gap-1 rounded-full bg-brand-soft pl-2.5 pr-1 text-sm font-medium text-ink-1"
            >
              {itemsByValue.get(itemValue)?.label ?? itemValue}
              <Combobox.ChipRemove
                data-slot="search-dropdown-chip-remove"
                className="flex size-4 items-center justify-center rounded-full text-ink-3 hover:text-ink-1"
              >
                <XIcon className="pointer-events-none size-3" />
              </Combobox.ChipRemove>
            </Combobox.Chip>
          ))}
          <Combobox.Input
            placeholder={selectedValues.length ? undefined : placeholder}
            className="min-w-16 flex-1 bg-transparent text-base outline-none placeholder:text-ink-4 md:text-sm text-ink-1"
            {...inputProps}
          />
          <div className="group ml-auto flex shrink-0 items-center gap-0.5">
            <Combobox.Clear
              data-slot="search-dropdown-clear"
              render={<Button variant="icon" size="icon-xs" type="button" />}
            >
              <XIcon className="pointer-events-none size-3.5" />
            </Combobox.Clear>
            <Combobox.Trigger
              data-slot="search-dropdown-trigger"
              render={<Button variant="icon" size="icon-xs" type="button" />}
              className={triggerButtonClassName}
            >
              <ChevronDownIcon className="pointer-events-none size-3.5 text-ink-3" />
            </Combobox.Trigger>
          </div>
        </Combobox.Chips>
      ) : (
        <div className="relative">
          <Combobox.Input
            placeholder={placeholder}
            className={cn(
              "flex h-[46px] w-full items-center rounded-[12px] border border-surface-line bg-surface-card px-3 pr-16 text-base outline-none transition-colors focus-visible:border-brand-green placeholder:text-ink-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-bg/50 disabled:opacity-50 aria-invalid:border-state-danger md:text-sm text-ink-1",
              className,
            )}
            {...inputProps}
          />
          <div className="group absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
            <Combobox.Clear
              data-slot="search-dropdown-clear"
              render={<Button variant="icon" size="icon-xs" type="button" />}
            >
              <XIcon className="pointer-events-none size-3.5" />
            </Combobox.Clear>
            <Combobox.Trigger
              data-slot="search-dropdown-trigger"
              render={<Button variant="icon" size="icon-xs" type="button" />}
              className={triggerButtonClassName}
            >
              <ChevronDownIcon className="pointer-events-none size-3.5 text-ink-3" />
            </Combobox.Trigger>
          </div>
        </div>
      )}

      <Combobox.Portal>
        <Combobox.Positioner
          side="bottom"
          sideOffset={6}
          align="start"
          anchor={multiple ? chipsAnchorRef : undefined}
          className="isolate z-50"
        >
          <Combobox.Popup
            data-slot="search-dropdown-content"
            className="group max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-lg border border-surface-line bg-surface-card text-ink-1 shadow-lg duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <Combobox.Empty
              data-slot="search-dropdown-empty"
              className="hidden w-full justify-center px-3 py-2 text-center text-sm text-ink-3 group-data-empty:flex"
            >
              {emptyText}
            </Combobox.Empty>
            <Combobox.List
              data-slot="search-dropdown-list"
              className="max-h-72 scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0"
            >
              {(item: SearchDropdownItem) => (
                <Combobox.Item
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className="relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-brand-soft data-highlighted:text-brand-green data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  {item.label}
                  <Combobox.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="pointer-events-none size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

export { SearchDropdown };
export type { SearchDropdownItem, SearchDropdownProps };
