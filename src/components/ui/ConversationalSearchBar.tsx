"use client";

import * as React from "react";
import { ArrowRight, ArrowUp, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SearchFilterChip } from "@/components/ui/SearchFilterChip";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import type { FilterItem } from "@/types/Search";

interface UnderstoodTag {
  key: string;
  label: string;
  value: string;
}

interface ConversationalSearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  askLabel?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  suggestionsLabel?: string;
  autoCompleteSuggestions?: string[];
  understoodTags?: UnderstoodTag[];
  onRemoveTag?: (key: string) => void;
  understoodLabel?: string;
  filters?: FilterItem[];
  onFilterApply?: (key: string, value: string | string[] | null) => void;
  onFilterClear?: (key: string) => void;
  filtersLabel?: string;
  loading?: boolean;
  compact?: boolean;
  className?: string;
}

function ConversationalSearchBar({
  value,
  onValueChange,
  onSubmit,
  placeholder = "Ask in plain English...",
  askLabel = "Ask in plain English",
  suggestions = [],
  onSuggestionSelect,
  suggestionsLabel = "Try",
  autoCompleteSuggestions = [],
  understoodTags,
  onRemoveTag,
  understoodLabel = "What we understood",
  filters,
  onFilterApply,
  onFilterClear,
  filtersLabel = "Filter by",
  loading = false,
  compact = false,
  className,
}: ConversationalSearchBarProps) {
  const tags = understoodTags ?? [];
  const isUnderstood = tags.length > 0;
  const showInlineButton = compact || isUnderstood;

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const caretToEndRef = React.useRef(false);

  React.useEffect(() => {
    if (!caretToEndRef.current) return;
    caretToEndRef.current = false;
    const textarea = textareaRef.current;
    textarea?.setSelectionRange(value.length, value.length);
  }, [value]);
  const ghostSuggestion =
    autoCompleteSuggestions.length === 1 &&
    value.length > 0 &&
    autoCompleteSuggestions[0].length > value.length &&
    autoCompleteSuggestions[0].toLowerCase().startsWith(value.toLowerCase())
      ? autoCompleteSuggestions[0]
      : null;
  const ghostSuffix = ghostSuggestion ? ghostSuggestion.slice(value.length) : "";

  const showDropdown = isFocused && autoCompleteSuggestions.length > 1;

  const completeGhost = () => {
    if (!ghostSuggestion) return;
    caretToEndRef.current = true;
    onValueChange(ghostSuggestion);
  };

  const selectSuggestion = (term: string) => {
    caretToEndRef.current = true;
    onValueChange(term);
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit(value.trim());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Tab" && ghostSuggestion) {
      event.preventDefault();
      completeGhost();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <form
        onSubmit={handleSubmit}
        data-state={isUnderstood ? "understood" : "idle"}
        className="relative flex flex-col gap-3 rounded-[24px] border border-surface-line bg-surface-card p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 shrink-0 text-brand-green" />
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="field-sizing-content relative z-10 max-h-32 w-full resize-none overflow-y-auto bg-transparent p-0 text-base text-ink-1 outline-none placeholder:text-ink-4 md:text-lg"
            />
            {ghostSuffix && (
              <div
                aria-hidden="true"
                className="field-sizing-content pointer-events-none absolute inset-0 z-0 max-h-32 overflow-hidden p-0 text-base whitespace-pre-wrap md:text-lg"
              >
                <span className="invisible">{value}</span>
                <span className="text-ink-4">{ghostSuffix}</span>
              </div>
            )}
          </div>
          {showInlineButton && (
            <Button
              type="submit"
              size="icon-lg"
              disabled={!value.trim() || loading}
              aria-label="Search"
              className="rounded-full"
            >
              <ArrowRight />
            </Button>
          )}
        </div>

        {!compact && !isUnderstood && (
          <>
            <div className="h-px w-full bg-surface-line" />
            <div className="flex items-center justify-between">
              <Typography variant="xs" className="font-mono tracking-[1.5px] text-ink-3 uppercase">
                {askLabel}
              </Typography>
              <Button
                type="submit"
                size="icon-lg"
                disabled={!value.trim() || loading}
                aria-label="Search"
                className="rounded-full"
              >
                <ArrowUp />
              </Button>
            </div>
          </>
        )}

        {showDropdown && (
          <div
            role="listbox"
            className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-surface-line bg-surface-card p-1.5 shadow-lg"
          >
            {autoCompleteSuggestions.map((term) => {
              const matchLength = term.toLowerCase().startsWith(value.toLowerCase())
                ? value.length
                : 0;
              return (
                <button
                  key={term}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(term)}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-ink-3 hover:bg-brand-soft"
                >
                  <span className="font-semibold text-ink-1">{term.slice(0, matchLength)}</span>
                  <span>{term.slice(matchLength)}</span>
                </button>
              );
            })}
          </div>
        )}
      </form>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Typography
            variant="xs"
            className="font-mono font-medium tracking-[1.5px] text-ink-3 uppercase"
          >
            {filtersLabel}
          </Typography>
          {filters.map((filter) => (
            <SearchFilterChip
              key={filter.key}
              filter={filter}
              onApply={(value) => onFilterApply?.(filter.key, value)}
              onClear={() => onFilterClear?.(filter.key)}
            />
          ))}
        </div>
      )}

      {!isUnderstood && suggestions?.length > 0 && (
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <Typography
            variant="xs"
            className="font-mono font-medium tracking-[1.5px] text-brand-green uppercase"
          >
            {suggestionsLabel}
          </Typography>
          {suggestions?.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              onClick={() => onSuggestionSelect?.(suggestion)}
              className="w-full text-left sm:w-auto"
            />
          ))}
        </div>
      )}

      {isUnderstood && (
        <div className="flex flex-wrap items-center gap-2">
          <Typography
            variant="xs"
            className="font-mono font-medium tracking-[1.5px] text-ink-3 uppercase"
          >
            {understoodLabel}
          </Typography>
          {tags.map((tag) => (
            <Chip
              key={tag.key}
              label={
                <>
                  <span className="text-ink-3">{tag.label}</span>{" "}
                  <span className="text-ink-1">{tag.value}</span>
                </>
              }
              rightIcon={<X className="size-3" />}
              rightIconLabel={`Remove ${tag.label}`}
              onRightIconClick={() => onRemoveTag?.(tag.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { ConversationalSearchBar };
export type { ConversationalSearchBarProps, UnderstoodTag };
