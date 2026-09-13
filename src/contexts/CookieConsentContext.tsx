"use client";

import * as React from "react";
import {
  getCookieConsentServerSnapshot,
  getCookieConsentSnapshot,
  subscribeCookieConsent,
  writeCookieConsent,
  type CookieConsent,
} from "@/lib/cookieConsent";

interface CookieConsentContextType {
  consent: CookieConsent | null;
  isReady: boolean;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (analytics: boolean) => void;
}

const CookieConsentContext = React.createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const stored = React.useSyncExternalStore(
    subscribeCookieConsent,
    getCookieConsentSnapshot,
    getCookieConsentServerSnapshot,
  );
  const consent = stored ?? null;
  const isReady = stored !== undefined;
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const savePreferences = React.useCallback((analytics: boolean) => {
    writeCookieConsent(analytics);
    setIsSettingsOpen(false);
  }, []);

  const value = React.useMemo<CookieConsentContextType>(
    () => ({
      consent,
      isReady,
      isSettingsOpen,
      openSettings: () => setIsSettingsOpen(true),
      closeSettings: () => setIsSettingsOpen(false),
      acceptAll: () => savePreferences(true),
      rejectAll: () => savePreferences(false),
      savePreferences,
    }),
    [consent, isReady, isSettingsOpen, savePreferences],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = React.useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}
