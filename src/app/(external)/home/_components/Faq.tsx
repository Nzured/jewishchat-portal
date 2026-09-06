"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { FAQS } from "@/configs/faq";
import { cn } from "@/lib/utils";
import { Header } from "./Header";

export function Faq() {
  const [open, setOpen] = React.useState<string | null>(FAQS[0]?.id ?? null);

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <Header
        className="self-start"
        tags={["Questions"]}
        title="The things people ask first."
        description="Everything else lives in the help centre."
      />

      <div className="border-t border-surface-line">
        {FAQS.map((faq) => {
          const isOpen = open === faq.id;
          return (
            <div key={faq.id} className="border-b border-surface-line">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <Typography
                  as="span"
                  className={cn(
                    "font-display text-[17px] leading-snug transition-colors duration-300",
                    isOpen ? "text-brand-deep" : "text-ink-1 group-hover:text-brand-deep",
                  )}
                >
                  {faq.question}
                </Typography>
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500",
                    isOpen
                      ? "rotate-45 border-brand-green bg-brand-green text-white"
                      : "border-surface-line-strong text-ink-3 group-hover:border-brand-green/50",
                  )}
                >
                  <Plus size={15} strokeWidth={2.1} />
                </span>
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-500",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <Typography
                    variant="small"
                    className="max-w-xl pr-4 pb-7 leading-relaxed text-ink-3 sm:pr-12"
                  >
                    {faq.answer}
                  </Typography>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
