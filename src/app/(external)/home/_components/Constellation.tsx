"use client";

import { useEffect, useRef, useState } from "react";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import type { ConstellationHandle } from "./ConstellationField";

export function Constellation() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<ConstellationHandle | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { isDesktop, reduced: prefersReduced } = ctx.conditions as {
          isDesktop: boolean;
          reduced: boolean;
        };
        setEnabled(isDesktop);
        setReduced(prefersReduced);
      },
    );

    return () => mm.revert();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!enabled || failed || !host || !canvas) return;

    let cancelled = false;
    let handle: ConstellationHandle | null = null;
    let ro: ResizeObserver | null = null;

    void import("./ConstellationField").then(({ createConstellation }) => {
      if (cancelled) return;

      handle = createConstellation(canvas, host);
      if (!handle) {
        setFailed(true);
        return;
      }
      handleRef.current = handle;
      setReady(true);

      ro = new ResizeObserver(() => handle?.resize());
      ro.observe(host);
    });

    return () => {
      cancelled = true;
      ro?.disconnect();
      handle?.dispose();
      handleRef.current = null;
      setReady(false);
    };
  }, [enabled, failed]);

  useEffect(() => {
    const handle = handleRef.current;
    if (!ready || !handle) return;

    if (reduced) {
      handle.stop();
      handle.renderOnce();
      return;
    }

    if (visible) handle.start();
    else handle.stop();
  }, [ready, reduced, visible]);

  const showCanvas = enabled && !failed;

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-[-18%] left-1/2 size-[52rem] -translate-x-1/2 rounded-full bg-brand-soft/45 blur-[120px]" />

      {showCanvas ? (
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      ) : (
        <LatticeBackdrop />
      )}
    </div>
  );
}
