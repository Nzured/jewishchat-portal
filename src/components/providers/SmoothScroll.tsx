"use client";

import { useEffect } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    void Promise.all([import("lenis"), import("@/lib/motion/gsap")]).then(
      ([{ default: Lenis }, { gsap, registerGsap, ScrollTrigger }]) => {
        if (cancelled) return;

        registerGsap();
        void document.fonts.ready.then(() => ScrollTrigger.refresh());

        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
          lenis.on("scroll", () => ScrollTrigger.update());

          const raf = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);

          return () => {
            gsap.ticker.remove(raf);
            lenis.destroy();
          };
        });

        cleanup = () => mm.revert();
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return children;
}
