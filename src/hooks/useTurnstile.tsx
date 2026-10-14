"use client";

import { ReactElement, useCallback, useRef, useState } from "react";
import { Turnstile, type TurnstileInstance, type TurnstileProps } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

interface UseTurnstileResult {
  token: string;
  widget: ReactElement;
  isReady: boolean;
  reset: () => void;
}
export function useTurnstile(options?: TurnstileProps["options"]): UseTurnstileResult {
  const [token, setToken] = useState("");
  const widgetRef = useRef<TurnstileInstance>(null);

  const reset = useCallback(() => {
    widgetRef.current?.reset();
    setToken("");
  }, []);

  const widget = (
    <Turnstile
      ref={widgetRef}
      siteKey={TURNSTILE_SITE_KEY}
      options={options}
      onSuccess={(newToken) => setToken(newToken)}
      onExpire={() => setToken("")}
      onError={() => setToken("")}
    />
  );

  return { token, widget, isReady: Boolean(token), reset };
}
