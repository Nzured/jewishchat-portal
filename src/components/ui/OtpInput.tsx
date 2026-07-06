"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  isVerifying?: boolean;
  isVerified?: boolean;
  hasError?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  className,
  disabled = false,
  isVerifying = false,
  isVerified = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = React.useRef<HTMLInputElement[]>([]);

  // Split value into array of characters, padding with empty strings
  const items = React.useMemo(() => {
    const valArr = value.split("");
    return Array.from({ length }, (_, i) => valArr[i] || "");
  }, [value, length]);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
      inputRefs.current[index].select();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      // If current is empty, delete previous and move focus back
      if (!items[index] && index > 0) {
        const newValue = [...items];
        newValue[index - 1] = "";
        onChange(newValue.join(""));
        focusInput(index - 1);
      } else {
        const newValue = [...items];
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!val) return;

    const char = val.slice(-1);
    const newValue = [...items];
    newValue[index] = char;
    onChange(newValue.join(""));

    // Focus next input
    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!pastedData) return;

    const cleanData = pastedData.replace(/[^a-zA-Z0-9]/g, "").slice(0, length);
    onChange(cleanData);

    const nextFocusIndex = Math.min(cleanData.length, length - 1);
    focusInput(nextFocusIndex);
  };

  return (
    <div className={cn("flex gap-1 sm:gap-3 w-full", className)}>
      {items.map((char, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={char}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-[42px] h-[42px] sm:w-[53px] sm:h-[53px] text-center text-base sm:text-xl font-semibold rounded-[12px] border outline-none transition-all disabled:opacity-50 px-0 shrink-0",
            "bg-white border-surface-line text-ink-1",
            "focus-visible:border-state-success focus-visible:ring-0",
            (isVerifying || isVerified) &&
              "bg-state-bg-success border-state-success text-state-success",
            hasError &&
              "bg-state-bg-error border-state-error text-state-error focus-visible:border-state-error",
          )}
        />
      ))}
    </div>
  );
}
