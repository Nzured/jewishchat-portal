"use client";

import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";

interface UseCharacterCountOptions<T extends HTMLInputElement | HTMLTextAreaElement> {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onChange?: (event: ChangeEvent<T>) => void;
}

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
