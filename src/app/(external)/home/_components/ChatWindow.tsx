"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@public/svgs";
import { Check, CornerDownRight } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import NextLink from "next/link";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { Link } from "@/components/ui/Link";
import { EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { getGroupPath } from "@/lib/publicPaths";
import type { SearchGroupResult } from "@/services/search/search.service";
import { useHeroSearch } from "../_context/HeroSearchContext";

type ChatMessage =
  | { id: string; role: "user"; kind: "text"; text: string; time: string }
  | { id: string; role: "assistant"; kind: "text"; text: string; time: string }
  | { id: string; role: "assistant"; kind: "typing" }
  | {
      id: string;
      role: "assistant";
      kind: "reply";
      text: string;
      tiles: SearchGroupResult[];
      overflow: number;
      href: string;
      time: string;
    };

let idSeq = 0;

const nextId = () => `chat-msg-${(idSeq += 1)}`;

const INTRO_TEXT =
  "Hi - ask me for a group the way you'd ask a friend. A trade, a city, a topic, or all three. I'll rank what actually fits.";

function introMessage(): ChatMessage {
  return { id: nextId(), role: "assistant", kind: "text", text: INTRO_TEXT, time: nowLabel() };
}

function replyText(count: number): string {
  if (count === 0) return "No matches yet — try a trade, a place, or a topic.";
  if (count === 1) return "Found one strong match:";
  return `Found ${count} matches — here are the closest:`;
}

function nowLabel(): string {
  return new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function ChatWindow() {
  const heroSearch = useHeroSearch();
  const query = heroSearch?.query ?? "";
  const results = heroSearch?.results ?? [];
  const totalResults = heroSearch?.totalResults ?? 0;

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const listRef = useRef<HTMLDivElement>(null);
  const bubbleEls = useRef(new Map<string, HTMLDivElement>());
  const animatedIds = useRef(new Set<string>());
  const reducedRef = useRef(false);

  const lastCommittedRef = useRef("");
  // The user+assistant bubble pair for the search currently being refined —
  // reused (in place) across debounce commits so typing "te" then "test"
  // updates one turn instead of stacking a new pair per commit.
  const activeTurnRef = useRef<{ userId: string; assistantId: string } | null>(null);
  const resultsRef = useRef(results);
  const totalRef = useRef(totalResults);
  useEffect(() => {
    resultsRef.current = results;
    totalRef.current = totalResults;
  }, [results, totalResults]);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const mm = gsap.matchMedia();
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        reducedRef.current = reduced;
      },
    );
    return () => mm.revert();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const reduced = reducedRef.current;

    for (const message of messages) {
      if (animatedIds.current.has(message.id)) continue;
      const el = bubbleEls.current.get(message.id);
      if (!el) continue;
      animatedIds.current.add(message.id);

      if (reduced) {
        gsap.set(el, { opacity: 1, y: 0, scale: 1 });
        continue;
      }

      if (message.kind === "reply") {
        const text = el.querySelector("[data-part='text']");
        const tiles = el.querySelectorAll("[data-part='tile']");
        const button = el.querySelector("[data-part='button']");
        const tl = gsap.timeline();
        tl.fromTo(
          el,
          { opacity: 0, y: 18, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" },
        );
        // A reply with no matches renders neither the tile grid nor the "See
        // more" button — only animate targets that actually exist, or GSAP
        // warns on the empty NodeList / null selector.
        if (text) {
          tl.fromTo(
            text,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" },
            "-=0.2",
          );
        }
        if (tiles.length > 0) {
          tl.fromTo(
            tiles,
            { opacity: 0, y: 12, scale: 0.86 },
            { opacity: 1, y: 0, scale: 1, duration: 0.34, stagger: 0.07, ease: "back.out(2)" },
            "-=0.08",
          );
        }
        if (button) {
          tl.fromTo(
            button,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
            "-=0.08",
          );
        }
      } else {
        gsap.fromTo(
          el,
          { opacity: 0, y: 16, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        );
      }
    }

    const list = listRef.current;
    if (!list) return;
    if (reduced) {
      list.scrollTop = list.scrollHeight;
      return;
    }
    const scrollTween = gsap.to(list, {
      scrollTop: list.scrollHeight,
      duration: 0.65,
      ease: "power2.out",
    });
    return () => {
      scrollTween.kill();
    };
  }, [messages]);

  useEffect(() => {
    if (reducedRef.current) {
      setMessages([introMessage()]);
      return;
    }

    const typingMsg: ChatMessage = { id: nextId(), role: "assistant", kind: "typing" };
    const showTyping = window.setTimeout(() => {
      if (lastCommittedRef.current !== "") return;
      setMessages([typingMsg]);
    }, 650);
    const showIntro = window.setTimeout(() => {
      if (lastCommittedRef.current !== "") return;
      setMessages([introMessage()]);
    }, 1500);

    return () => {
      window.clearTimeout(showTyping);
      window.clearTimeout(showIntro);
    };
  }, []);

  const isSearching = heroSearch?.isSearching ?? false;

  // Commits the debounced query as a chat turn. While the user keeps
  // refining the same search (activeTurnRef is still set), this updates the
  // existing user bubble's text and swaps in a fresh "typing" bubble instead
  // of stacking a new pair — otherwise every debounce tick posts a new turn.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === lastCommittedRef.current) return;
    lastCommittedRef.current = trimmed;

    const turn = activeTurnRef.current;
    activeTurnRef.current = trimmed
      ? { userId: turn?.userId ?? nextId(), assistantId: nextId() }
      : null;
    const nextTurn = activeTurnRef.current;

    setMessages((prev) => {
      if (!trimmed || !nextTurn) return [introMessage()];

      const typingMsg: ChatMessage = {
        id: nextTurn.assistantId,
        role: "assistant",
        kind: "typing",
      };
      const withoutPrevAssistant = turn ? prev.filter((m) => m.id !== turn.assistantId) : prev;

      if (turn) {
        return withoutPrevAssistant
          .map((m) => (m.id === turn.userId ? { ...m, text: trimmed, time: nowLabel() } : m))
          .concat(typingMsg);
      }

      const userMsg: ChatMessage = {
        id: nextTurn.userId,
        role: "user",
        kind: "text",
        text: trimmed,
        time: nowLabel(),
      };
      return [...prev, userMsg, typingMsg];
    });
  }, [query]);

  // Swaps the pending "typing" bubble for the real reply once the search for
  // the current turn settles — a replacement, never an additional message.
  useEffect(() => {
    if (isSearching) return;
    const turn = activeTurnRef.current;
    if (!turn) return;

    const currentResults = resultsRef.current;
    const currentTotal = totalRef.current;
    const replyId = nextId();
    const reply: ChatMessage = {
      id: replyId,
      role: "assistant",
      kind: "reply",
      text: replyText(currentTotal),
      tiles: currentResults,
      overflow: Math.max(0, currentTotal - currentResults.length),
      href: `${EXTERNAL_GROUPS_PATH}?q=${encodeURIComponent(lastCommittedRef.current)}`,
      time: nowLabel(),
    };

    activeTurnRef.current = { userId: turn.userId, assistantId: replyId };
    setMessages((prev) => prev.filter((m) => m.id !== turn.assistantId).concat(reply));
  }, [isSearching, query]);

  const isTyping = messages.some((m) => m.kind === "typing");
  const wrapRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const wrap = wrapRef.current;
    if (!wrap) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };

        if (reduced) {
          gsap.set(wrap, { opacity: 1, y: 0, scale: 1 });
          return;
        }

        const entrance = gsap.from(wrap, {
          y: 36,
          opacity: 0,
          scale: 0.97,
          duration: 1.05,
          delay: 0.25,
          ease: "power4.out",
        });

        return () => {
          entrance.kill();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      data-hero-chat-window
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-surface-line bg-surface-card shadow-[0_50px_100px_-40px_color-mix(in_oklab,var(--color-ink-1)_45%,transparent),0_16px_32px_-20px_color-mix(in_oklab,var(--color-ink-1)_28%,transparent)]"
    >
      <div className="relative z-10 flex shrink-0 items-center gap-2.5 border-b border-surface-line bg-surface-card px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft">
          <Image
            src={Logo as StaticImageData}
            alt=""
            width={18}
            height={18}
            className="shrink-0 rounded-full"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm leading-tight text-ink-1">JewishChat</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs leading-tight text-ink-3">
            <span
              className={
                isTyping
                  ? "size-[6px] shrink-0 rounded-full bg-ink-4"
                  : "size-[6px] shrink-0 rounded-full bg-brand-green"
              }
            />
            {isTyping ? "typing…" : "online"}
          </p>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <LatticeBackdrop className="text-brand-green opacity-[0.12]" />
        <div
          ref={listRef}
          aria-live="polite"
          className="no-scrollbar relative flex h-full min-h-0 flex-col overflow-y-auto px-4 py-4"
        >
          <div className="mt-auto flex flex-col gap-2.5">
            {messages.length > 0 ? (
              <div className="mx-auto">
                <span className="rounded-full bg-surface-line/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-ink-3">
                  Today
                </span>
              </div>
            ) : null}

            {messages.map((message) => (
              <Bubble
                key={message.id}
                message={message}
                register={(el) => {
                  if (el) bubbleEls.current.set(message.id, el);
                  else bubbleEls.current.delete(message.id);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  message,
  register,
}: {
  message: ChatMessage;
  register: (el: HTMLDivElement | null) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div
      ref={register}
      className={
        isUser
          ? "relative ml-auto w-fit max-w-[78%] rounded-[16px] rounded-tr-[4px] bg-brand-green px-3.5 py-2 text-xs leading-snug break-words text-white"
          : "relative mr-auto w-fit max-w-[82%] rounded-[16px] rounded-tl-[4px] border border-surface-line bg-surface-card px-3.5 py-2 break-words shadow-[0_2px_10px_-6px_color-mix(in_oklab,var(--color-ink-1)_30%,transparent)]"
      }
    >
      {message.kind === "text" ? (
        <div className="flex items-end gap-2">
          <span className={isUser ? "min-w-0" : "min-w-0 text-xs leading-snug text-ink-2"}>
            {message.text}
          </span>
          <BubbleMeta time={message.time} isUser={isUser} read={isUser} />
        </div>
      ) : null}

      {message.kind === "typing" ? <TypingDots /> : null}

      {message.kind === "reply" ? (
        <>
          <p data-part="text" className="text-xs leading-snug text-ink-2">
            {message.text}
          </p>

          {message.tiles.length > 0 ? (
            <div
              className="mt-2.5 grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${message.tiles.length + (message.overflow > 0 ? 1 : 0)}, 1fr)`,
              }}
            >
              {message.tiles.map((group) => (
                <NextLink
                  key={group.uuid}
                  data-part="tile"
                  href={getGroupPath(group)}
                  title={group.name}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[11px] border border-brand-green/15 bg-brand-soft transition-colors hover:border-brand-green/40"
                >
                  <span className="font-display text-sm leading-none tracking-tight text-brand-deep">
                    {initialsOf(group.name)}
                  </span>
                  <span className="w-full truncate px-1 text-center text-[7.5px] leading-none text-ink-3">
                    {group.locationCity || group.locationCountry}
                  </span>
                </NextLink>
              ))}

              {message.overflow > 0 ? (
                <div
                  data-part="tile"
                  className="flex aspect-square flex-col items-center justify-center rounded-[11px] border border-dashed border-surface-line-strong text-ink-3"
                >
                  <span className="font-display text-sm leading-none">+{message.overflow}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {message.tiles.length > 0 ? (
            <Link
              data-part="button"
              href={message.href}
              className="mt-2.5 inline-flex items-center gap-1 text-xs text-brand-deep hover:text-brand-green"
            >
              See more
              <CornerDownRight size={11} strokeWidth={2} />
            </Link>
          ) : null}

          <div className="mt-1.5 flex justify-end">
            <BubbleMeta time={message.time} isUser={false} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function BubbleMeta({ time, isUser, read }: { time: string; isUser: boolean; read?: boolean }) {
  return (
    <span
      className={
        isUser
          ? "flex shrink-0 translate-y-[1px] items-center gap-0.5 text-[9px] leading-none whitespace-nowrap text-white/70"
          : "flex shrink-0 translate-y-[1px] items-center gap-0.5 text-[9px] leading-none whitespace-nowrap text-ink-4"
      }
    >
      {time}
      {isUser ? (
        <span className={read ? "text-white" : "text-white/60"}>
          <Check size={10} strokeWidth={2.5} className="-mr-1.5 inline" />
          <Check size={10} strokeWidth={2.5} className="inline" />
        </span>
      ) : null}
    </span>
  );
}

function TypingDots() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dots = el.querySelectorAll("[data-dot]");
    const tween = gsap.to(dots, {
      y: -4,
      duration: 0.45,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.14, repeat: -1 },
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={ref} className="flex items-center gap-1.5 px-0.5 py-0.5">
      <span data-dot className="size-[6px] rounded-full bg-ink-4" />
      <span data-dot className="size-[6px] rounded-full bg-ink-4" />
      <span data-dot className="size-[6px] rounded-full bg-ink-4" />
    </div>
  );
}
