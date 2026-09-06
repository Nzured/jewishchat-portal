"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { PlatformStats } from "@/types/Stats";
import { useHome } from "../_context/HomeContext";

interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  label: string;
}

function abbreviate(value: number): { value: number; suffix?: string } {
  if (value >= 1_000_000) return { value: Math.round(value / 1_000_000), suffix: "m" };
  if (value >= 10_000) return { value: Math.round(value / 1_000), suffix: "k" };
  return { value };
}

function buildStats(stats: PlatformStats): StatItem[] {
  return [
    { id: "groups", ...abbreviate(stats.groupsListed), label: "Groups listed" },
    { id: "categories", value: stats.categories, label: "Categories" },
    { id: "members", ...abbreviate(stats.membersReached), label: "Members reached" },
    { id: "countries", value: stats.countriesWorldwide, label: "Countries worldwide" },
  ];
}

function StatBandContent({ items }: { items: StatItem[] }) {
  const ref = React.useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        const nodes = gsap.utils.toArray<HTMLElement>("[data-count]", root);

        if (reduced) {
          nodes.forEach((node) => {
            node.textContent = Number(node.dataset.count ?? "0").toLocaleString("en-US");
          });
          return;
        }

        const tweens = nodes.map((node) => {
          const end = Number(node.dataset.count ?? "0");
          const proxy = { v: 0 };
          return gsap.to(proxy, {
            v: end,
            duration: 1.7,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 92%" },
            onUpdate: () => {
              node.textContent = Math.round(proxy.v).toLocaleString("en-US");
            },
          });
        });

        return () => {
          tweens.forEach((tween) => {
            tween.kill();
          });
        };
      },
    );

    return () => mm.revert();
  }, [items]);

  return (
    <div ref={ref} className="border-y border-surface-line bg-surface-card/60 backdrop-blur-sm">
      <dl className="mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:px-8 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`border-surface-line py-8 lg:py-10 ${
              index % 2 === 1 ? "border-l pl-6" : "pr-6"
            } ${index < 2 ? "border-b lg:border-b-0" : ""} ${index === 2 ? "lg:border-l lg:pl-6" : ""}`}
          >
            <dd className="font-display-tight text-[clamp(1.9rem,3.4vw,2.9rem)] leading-none text-ink-1">
              <span data-count={item.value}>{item.value.toLocaleString("en-US")}</span>
              {item.suffix ? <span className="text-brand-green">{item.suffix}</span> : null}
            </dd>
            <dt className="mt-2.5 text-[13px] text-ink-3">{item.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function StatBand() {
  const { stats, isLoading } = useHome();

  if (isLoading) {
    return (
      <div className="border-y border-surface-line bg-surface-card/60 backdrop-blur-sm">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:px-8 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="py-8 pr-6 lg:py-10">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="mt-3 h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return <StatBandContent items={buildStats(stats)} />;
}
