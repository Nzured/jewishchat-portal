"use client";

import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

export function CookieSettingsLink() {
  const { openSettings } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={openSettings}
      className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-sm text-[13px] font-medium text-brand-green hover:underline focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:outline-none"
    >
      <Cookie className="size-3.5" />
      Cookie settings
    </button>
  );
}
