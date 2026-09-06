"use client";

import { useEffect, useRef } from "react";
import { Camera, Link2, MessageSquare, ShieldCheck, Tags } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { EXTERNAL_GROUPS_NEW_PATH } from "@/configs/const";
import { gsap, registerGsap, ScrollTrigger, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { Header } from "./Header";
import { useHome } from "../_context/HomeContext";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; title: string; body: string };

const STEPS: Step[] = [
  {
    icon: Link2,
    title: "Paste the group link",
    body: "Drop in the WhatsApp invite link with a name and a short description. Duplicate links are caught before you submit - the URL is normalised first, so extra query parameters never sneak a second copy in.",
  },
  {
    icon: Tags,
    title: "Categorise it",
    body: "Pick a main category, add secondary ones, and set the location. Say whether the join link should be public or reserved for signed-in members.",
  },
  {
    icon: ShieldCheck,
    title: "Verify your number",
    body: "A code arrives on WhatsApp. Verifying proves the listing came from a real person - it is the one thing standing between the directory and spam.",
  },
  {
    icon: Camera,
    title: "Add a photo, or skip",
    body: "Upload a square image, or skip it and the listing shows a clean initials avatar. You can add the photo later from My Groups.",
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <article className="relative flex flex-col justify-between rounded-[26px] border border-surface-line bg-surface-card p-8 lg:h-[26rem] lg:w-[24rem] lg:shrink-0">
      <div>
        <span className="font-display block text-[3.5rem] leading-none text-brand-green/25">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="mt-6 inline-flex size-12 items-center justify-center rounded-[15px] bg-brand-soft text-brand-deep">
          <step.icon size={21} strokeWidth={1.7} />
        </span>
        <Typography as="h3" variant="large" className="font-display mt-5 leading-snug text-ink-1">
          {step.title}
        </Typography>
        <Typography variant="small" className="mt-3 leading-relaxed text-ink-3">
          {step.body}
        </Typography>
      </div>
    </article>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useHome();

  useEffect(() => {
    if (isLoading) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [isLoading]);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        pan: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        stacked: "(max-width: 1023px), (prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { stacked } = ctx.conditions as { pan: boolean; stacked: boolean };

        if (stacked) {
          gsap.set(track, { clearProps: "x" });
          return;
        }

        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.5}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden lg:motion-safe:flex lg:motion-safe:min-h-dvh lg:motion-safe:flex-col lg:motion-safe:justify-center"
    >
      <Header
        tags={["Listing a group"]}
        title="Four steps, about two minutes."
        description="Verified submissions publish instantly. Nothing sits in a moderation queue waiting for someone to notice it."
      />

      <div className="mt-10 lg:mt-14">
        <div
          ref={trackRef}
          className="flex flex-col gap-4 lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:gap-6 lg:motion-safe:pr-[12vw] lg:motion-reduce:flex-col"
        >
          {STEPS.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}

          <article className="relative flex flex-col justify-between overflow-hidden rounded-[26px] bg-brand-green p-8 text-white lg:h-[26rem] lg:w-[24rem] lg:shrink-0">
            <MessageSquare
              size={140}
              strokeWidth={0.6}
              className="pointer-events-none absolute -right-8 -bottom-8 text-white/15"
            />
            <div className="relative">
              <Typography as="h3" className="font-display text-[24px] leading-[1.1]">
                Your group, in front of the people looking for it.
              </Typography>
              <Typography variant="small" className="mt-4 leading-relaxed text-white/85">
                Each listing gets its own indexed page and a clean URL, so it turns up in search
                long after you post it.
              </Typography>
            </div>
            <Button variant="secondary" size="lg" className="relative mt-8 w-fit" asChild>
              <NextLink href={EXTERNAL_GROUPS_NEW_PATH}>Add a group</NextLink>
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
