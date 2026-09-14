"use client";

import { RotateCcw } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_HOME_PATH } from "@/configs/const";

interface ErrorStateProps {
  reset: () => void;
  homeHref?: string;
}

export function ErrorState({ reset, homeHref = EXTERNAL_HOME_PATH }: ErrorStateProps) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="flex flex-col gap-3">
        <Typography
          variant="tiny"
          className="font-mono tracking-[1.6px] text-brand-green uppercase"
        >
          Something went wrong
        </Typography>
        <Typography variant="h1" className="font-display font-bold text-ink-1">
          This page hit a snag
        </Typography>
        <Typography variant="muted" className="text-base">
          We couldn&apos;t load this page. Try again, or head back home while we sort it out.
        </Typography>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" leftIcon={<RotateCcw className="size-4" />} onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <NextLink href={homeHref}>Go home</NextLink>
        </Button>
      </div>
    </section>
  );
}
