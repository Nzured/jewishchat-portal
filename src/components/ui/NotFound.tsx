"use client";

import { ArrowLeft, LayoutGrid } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createLazyLottie } from "@/components/ui/LazyLottie";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_CATEGORIES_PATH, EXTERNAL_HOME_PATH } from "@/configs/const";

const NotFoundAnimation = createLazyLottie(() => import("@/assets/animations/404 Error.json"));

export function NotFound() {
  const router = useRouter();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-8 px-2 py-8 text-center md:flex-row md:gap-12 md:py-16 md:text-left">
      <div className="w-full max-w-xs shrink-0 md:max-w-sm">
        <NotFoundAnimation loop className="h-auto w-full" />
      </div>

      <div className="flex max-w-lg flex-col items-center gap-6 md:items-start">
        <div className="flex flex-col gap-3">
          <Typography
            variant="tiny"
            className="font-mono tracking-[1.6px] text-brand-green uppercase"
          >
            404 · Page not found
          </Typography>
          <Typography variant="h1" className="font-display font-bold text-ink-1">
            This page wandered off
          </Typography>
          <Typography variant="muted" className="text-base">
            The link may be old, the group may have been removed, or the address has a typo. The
            directory is still right here though.
          </Typography>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
          <Button asChild variant="outline" leftIcon={<LayoutGrid className="size-4" />}>
            <NextLink href={EXTERNAL_CATEGORIES_PATH}>Browse categories</NextLink>
          </Button>
          <Button asChild variant="outline">
            <NextLink href={EXTERNAL_HOME_PATH}>Go home</NextLink>
          </Button>
          <Button
            type="button"
            variant="link"
            leftIcon={<ArrowLeft className="size-4" />}
            onClick={() => router.back()}
          >
            Go back
          </Button>
        </div>
      </div>
    </section>
  );
}
