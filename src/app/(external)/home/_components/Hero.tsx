"use client";

import { useRef } from "react";
import { ArrowDown, ShieldCheck } from "lucide-react";
import { Link } from "@/components/ui/Link";
import { Typography } from "@/components/ui/Typography";
import { gsap, SplitText, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { ChatWindow } from "./ChatWindow";
import { Constellation } from "./Constellation";
import { HomeSearchBar } from "./HomeSearchBar";
import { HeroSearchProvider } from "../_context/HeroSearchContext";
import { useHome } from "../_context/HomeContext";

export function Hero() {
  return (
    <HeroSearchProvider>
      <HeroSection />
    </HeroSearchProvider>
  );
}

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { stats } = useHome();

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
        const items = root.querySelectorAll("[data-hero-item]");
        const heading = root.querySelector<HTMLElement>("[data-hero-title]");

        if (reduced || !heading) {
          gsap.set(items, { opacity: 1, y: 0 });
          return;
        }

        const outer = new SplitText(heading, { type: "lines", linesClass: "overflow-hidden" });
        const inner = new SplitText(outer.lines, { type: "lines" });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from(inner.lines, { yPercent: 120, duration: 1.15, stagger: 0.09 }).from(
          items,
          { opacity: 0, y: 26, duration: 0.9, stagger: 0.11 },
          "-=0.75",
        );

        return () => {
          tl.kill();
          inner.revert();
          outer.revert();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[520px] flex-col justify-center overflow-hidden py-16 xl:min-h-[calc(100dvh-4rem)]"
    >
      <Constellation />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
          <div className="max-w-4xl">
            <span
              data-hero-item
              className="border-brand-green/25 text-brand-deep mb-5 inline-flex items-center gap-2 rounded-full border bg-surface-card/70 px-3 py-1 text-[11px] font-medium backdrop-blur-sm"
            >
              <ShieldCheck size={12} strokeWidth={2} />
              Every listing submitted by a verified member
            </span>

            <h1
              data-hero-title
              className="font-display-tight text-ink-1 text-balance text-[clamp(2.1rem,4.6vw,4rem)] leading-[1.02] md:max-w-[22ch] md:text-[2rem] lg:text-[2.5rem] xl:max-w-none xl:text-[clamp(2.1rem,4.6vw,4rem)] xl:leading-[0.96]"
            >
              Find the group your community is <span className="text-brand-green">already in</span>
            </h1>

            <Typography
              data-hero-item
              variant="p"
              className="text-ink-2 mt-4 max-w-xl text-sm leading-relaxed lg:text-base"
            >
              WhatsApp groups for Jewish business, learning, shuls and chesed. Ask the way
              you&rsquo;d ask a friend - results come back ranked by how well they fit.
            </Typography>

            <div data-hero-item className="mt-7 w-full max-w-[560px]">
              <HomeSearchBar />
            </div>

            <Typography data-hero-item variant="tiny" className="text-ink-4 mt-6 block">
              Free to browse · No account needed to search
              {stats
                ? ` · ${stats.groupsListed.toLocaleString("en-US")} groups across ${stats.countriesWorldwide.toLocaleString("en-US")} countries`
                : ""}
            </Typography>
          </div>

          <div data-hero-item className="hidden h-[380px] w-full md:block xl:h-[450px]">
            <ChatWindow />
          </div>
        </div>
      </div>

      <Link
        href="#categories"
        aria-label="Scroll to categories"
        className="text-ink-4 hover:text-brand-green absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] tracking-[0.16em] uppercase transition-colors hover:no-underline xl:flex"
      >
        Browse
        <ArrowDown size={14} strokeWidth={1.8} className="animate-bounce" />
      </Link>
    </section>
  );
}
