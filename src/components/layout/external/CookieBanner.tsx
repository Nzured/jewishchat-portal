"use client";

import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { NAME_PART_ONE, NAME_PART_TWO } from "@/configs/const";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

export function CookieBanner() {
  const { consent, isReady, isSettingsOpen, openSettings, acceptAll, rejectAll } =
    useCookieConsent();

  if (!isReady || consent || isSettingsOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-surface-line bg-surface-card p-4 shadow-xl md:flex-row md:items-center md:gap-6 md:px-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-state-bg-success text-brand-green">
            <Cookie className="size-4.5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Typography variant="small" className="font-semibold text-ink-1">
              We use cookies to keep {NAME_PART_ONE + NAME_PART_TWO} working
            </Typography>
            <Typography variant="xs" className="text-ink-3">
              Only essential cookies are set until you choose. Analytics stay off unless you turn
              them on.
            </Typography>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
          <Button type="button" variant="link" size="sm" onClick={openSettings}>
            Cookie settings
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={rejectAll}>
            Reject all
          </Button>
          <Button type="button" color="primary" size="sm" onClick={acceptAll}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
