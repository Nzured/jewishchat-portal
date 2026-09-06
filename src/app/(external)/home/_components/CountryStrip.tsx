"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Typography } from "@/components/ui/Typography";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { useHome } from "../_context/HomeContext";

const MIN_TRACK_ITEMS = 10;

function dedupe(countries: string[]): string[] {
  const byKey = new Map<string, string>();

  for (const raw of countries) {
    const name = raw?.trim();
    if (!name) continue;
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const existing = byKey.get(key);
    if (!existing || name.length > existing.length) byKey.set(key, name);
  }

  return [...byKey.values()];
}

function CountryTicker({ countries }: { countries: string[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  const half = React.useMemo(() => {
    const repeats = Math.max(1, Math.ceil(MIN_TRACK_ITEMS / countries.length));
    return Array.from({ length: repeats }, () => countries).flat();
  }, [countries]);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const track = trackRef.current;
    if (!track) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.to(track, {
        xPercent: -50,
        duration: half.length * 2 * 2.2,
        ease: "none",
        repeat: -1,
      });
      return () => tween.kill();
    });

    return () => mm.revert();
  }, [half]);

  return (
    <div className="relative overflow-hidden motion-reduce:overflow-x-auto">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-bg to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-bg to-transparent md:w-24" />
      <div ref={trackRef} className="flex w-max gap-3">
        {[...half, ...half].map((country, index) => (
          <span
            key={`${country}-${index}`}
            className="font-display shrink-0 rounded-full border border-surface-line bg-surface-card px-6 py-3 text-[15px] whitespace-nowrap text-ink-2"
          >
            {country}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CountryStrip() {
  const { countries, isLoading } = useHome();

  const visible = React.useMemo(() => dedupe(countries), [countries]);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <Skeleton className="h-3 w-20" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-36 shrink-0 rounded-full" />
          ))}
        </div>
      </section>
    );
  }

  if (visible.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <Typography
        variant="xs"
        className="font-mono font-medium tracking-[1.5px] text-brand-green uppercase"
      >
        Active in
      </Typography>
      <div className="-mx-4 md:-mx-8">
        <CountryTicker countries={visible} />
      </div>
    </section>
  );
}
