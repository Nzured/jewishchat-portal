"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";
import { Typography } from "./Typography";

interface LinkDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  copyText?: string;
  external?: boolean;
}

export function LinkDisplay({
  url,
  copyText,
  external = true,
  className,
  ...props
}: LinkDisplayProps) {
  const handleOpen = () => {
    const targetUrl =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-4 rounded-xl border border-surface-line bg-surface-bg p-3 px-4",
        className,
      )}
      {...props}
    >
      <Typography variant={"tiny"} className="font-mono text-ink-2 select-all truncate">
        {url}
      </Typography>
      <div className="flex items-center gap-2 shrink-0">
        <CopyButton
          value={copyText || url}
          onCopy={() => toast.success("Copied to clipboard!")}
          aria-label="Copy to clipboard"
          className="text-ink-3 hover:text-brand-green"
        />
        {external && (
          <Button
            onClick={handleOpen}
            variant="outline"
            size="icon"
            className="text-ink-3 hover:text-brand-green"
            aria-label="Open link in new tab"
          >
            <ExternalLink className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
