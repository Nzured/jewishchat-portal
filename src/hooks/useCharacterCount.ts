"use client";

import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";

interface UseCharacterCountOptions<T extends HTMLInputElement | HTMLTextAreaElement> {
  /** Current value when the field is controlled. */
  value?: string | number | readonly string[];
  /** Initial value when the field is uncontrolled (e.g. registered with react-hook-form). */
  defaultValue?: string | number | readonly string[];
  onChange?: (event: ChangeEvent<T>) => void;
}

/**
 * Tracks how many characters a field currently holds so a `n/maxLength` counter can be shown.
 * Works for controlled and uncontrolled fields alike — the returned `handleChange` must be
 * wired to the element so uncontrolled values stay in sync.
 */
export function useCharacterCount<T extends HTMLInputElement | HTMLTextAreaElement>({
  value,
  defaultValue,
  onChange,
}: UseCharacterCountOptions<T>) {
  const [uncontrolledLength, setUncontrolledLength] = useState(
    () => String(defaultValue ?? "").length,
  );

  const handleChange = useCallback(
    (event: ChangeEvent<T>) => {
      setUncontrolledLength(event.target.value.length);
      onChange?.(event);
    },
    [onChange],
  );

  return {
    length: value !== undefined ? String(value).length : uncontrolledLength,
    handleChange,
  };
}
