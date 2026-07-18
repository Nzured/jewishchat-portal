"use client";

import * as React from "react";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  leftIcon?: React.ReactNode;
  /** Shows a spinner at the end of the field, e.g. while a debounced check is in flight. */
  loading?: boolean;
}

function Input({ className, type, error, leftIcon, loading, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const showError = error && !loading;

  return (
    <div className="relative">
      {leftIcon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-4 [&_svg]:size-4">
          {leftIcon}
        </div>
      )}
      <input
        type={isPassword && showPassword ? "text" : type}
        data-slot="input"
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "flex min-h-[46px] w-full self-stretch items-start justify-center min-w-0 rounded-[12px] border border-surface-line bg-surface-card px-3 py-3 text-base transition-colors outline-none focus-visible:border-brand-green file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-1 placeholder:text-ink-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-bg/50 disabled:opacity-50 aria-invalid:border-state-danger md:text-sm",
          leftIcon && "pl-10",
          (isPassword || loading) && "pr-10",
          showError && !isPassword && "pr-10",
          showError && isPassword && "pr-16",
          className,
        )}
        {...props}
      />
      {loading && (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {showError && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-state-danger cursor-pointer",
                isPassword ? "right-10" : "right-3",
              )}
            >
              <AlertCircle className="h-5 w-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent>{error}</TooltipContent>
        </Tooltip>
      )}
      {isPassword && !loading && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 focus:outline-none"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export { Input };
