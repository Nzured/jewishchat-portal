"use client";

import { useRef } from "react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "./gsap";

type RevealOptions = {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
};

export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const { selector = "[data-reveal]", y = 28, stagger = 0.07, start = "top 82%" } = options;
  const ref = useRef<T>(null);

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
        const targets = gsap.utils.toArray<HTMLElement>(selector, root);
        if (!targets.length) return;

        if (reduced) {
          gsap.set(targets, { opacity: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start },
          },
        );
      },
    );

    return () => mm.revert();
  }, [selector, y, stagger, start]);

  return ref;
}
