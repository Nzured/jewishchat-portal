"use client";

import { Flag, Gauge, ShieldCheck, Siren } from "lucide-react";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { useReveal } from "@/lib/motion/useReveal";
import type { LucideIcon } from "lucide-react";

type Pillar = { icon: LucideIcon; title: string; body: string };

const PILLARS: Pillar[] = [
  {
    icon: ShieldCheck,
    title: "Verified submitters only",
    body: "Every listing comes from an account that confirmed both an email address and a WhatsApp number. Unverified accounts cannot submit at all.",
  },
  {
    icon: Flag,
    title: "Reporting that goes somewhere",
    body: "Signed-in members can report a broken link or inappropriate content. Moderators see every report filed against a group together, on one screen.",
  },
  {
    icon: Gauge,
    title: "Thresholds, not guesswork",
    body: "Once a listing passes its report threshold it is suspended automatically, pending review - no waiting for someone to be at a desk.",
  },
  {
    icon: Siren,
    title: "Protected infrastructure",
    body: "Traffic sits behind a WAF with DDoS mitigation, every public form is captcha-protected, and OTP requests are rate-limited by IP.",
  },
];

export function TrustSafety() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.08, y: 32 });

  return (
    <section className="relative -mx-4 overflow-hidden bg-ink-1 py-20 text-white md:-mx-8 lg:py-28">
      <LatticeBackdrop className="text-brand-green/60 opacity-40" />

      <div className="relative mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold tracking-[0.18em] text-brand-green uppercase">
            Trust &amp; safety
          </p>
          <h2 className="font-display-tight text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02] text-balance text-white">
            An open directory only works if someone is minding it.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/65">
            Anyone can list a group, which is the point - so the safeguards sit around the listing,
            not in front of it.
          </p>
        </div>

        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              data-reveal
              className="relative bg-ink-1 p-7 ring-1 ring-white/10"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-[13px] bg-brand-green/12 text-brand-green">
                <pillar.icon size={20} strokeWidth={1.7} />
              </span>
              <h3 className="font-display mt-5 text-[16.5px] leading-snug text-white">
                {pillar.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/55">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
