"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./Button";

interface CopyButtonProps {
  value: string;
  className?: string;
  onCopy?: () => void;
  "aria-label"?: string;
}

export function CopyButton({
  value,
  className,
  onCopy,
  "aria-label": ariaLabel = "Copy to clipboard",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void window.navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="icon-sm"
      className={className}
      aria-label={ariaLabel}
      color="primary"
    >
      {copied ? <Check className="size-4 text-brand-green" /> : <Copy className="size-4" />}
    </Button>
  );
}
