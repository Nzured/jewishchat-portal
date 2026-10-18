"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

const DURATION_MS = 900;
const NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/g;

interface NumberToken {
  value: number;
  decimals: number;
}

function parseNumbers(text: string): NumberToken[] {
  return Array.from(text.matchAll(NUMBER_PATTERN), ([match]) => ({
    value: Number(match.replace(/,/g, "")),
    decimals: match.split(".")[1]?.length ?? 0,
  }));
}

function renderAt(text: string, tokens: NumberToken[], values: number[]) {
  let index = 0;
  return text.replace(NUMBER_PATTERN, () => {
    const { decimals } = tokens[index];
    const current = values[index] ?? 0;
    index += 1;
    return current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  });
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

export interface AnimatedValueProps {
  value: ReactNode;
}

export function AnimatedValue({ value }: AnimatedValueProps) {
  const text =
    typeof value === "number" ? value.toLocaleString() : typeof value === "string" ? value : null;
  const currentRef = useRef<number[]>([]);
  const [display, setDisplay] = useState(() =>
    text === null ? null : renderAt(text, parseNumbers(text), []),
  );

  useEffect(() => {
    if (text === null) return;

    const tokens = parseNumbers(text);
    const from =
      currentRef.current.length === tokens.length ? currentRef.current : tokens.map(() => 0);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion || tokens.length === 0 ? 0 : DURATION_MS;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1);
      const eased = easeOutCubic(progress);
      currentRef.current = tokens.map(
        (token, index) => from[index] + (token.value - from[index]) * eased,
      );
      setDisplay(progress === 1 ? text : renderAt(text, tokens, currentRef.current));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  if (text === null) return value;
  return <span className="tabular-nums">{display}</span>;
}
