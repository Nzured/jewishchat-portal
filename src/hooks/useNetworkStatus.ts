"use client";

import * as React from "react";
import { isNetworkSlow, resetNetworkHealth, subscribeNetworkHealth } from "@/lib/networkHealth";

const SLOW_EFFECTIVE_TYPES = new Set(["slow-2g", "2g"]);
const SLOW_DOWNLINK_MBPS = 0.6;

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}

export interface NetworkStatus {
  online: boolean;
  slow: boolean;
}

function getConnection(): NetworkInformation | null {
  if (typeof navigator === "undefined") return null;
  return (navigator as Navigator & { connection?: NetworkInformation }).connection ?? null;
}

function hasSlowConnection(connection: NetworkInformation | null) {
  if (!connection) return false;
  if (connection.effectiveType && SLOW_EFFECTIVE_TYPES.has(connection.effectiveType)) return true;
  return typeof connection.downlink === "number" && connection.downlink > 0
    ? connection.downlink < SLOW_DOWNLINK_MBPS
    : false;
}

/**
 * Combines what the browser reports about the connection (Chromium only) with how
 * slow our own API calls have actually been, which works in every browser.
 */
export function useNetworkStatus(): NetworkStatus {
  const [browserStatus, setBrowserStatus] = React.useState({ online: true, slowConnection: false });

  React.useEffect(() => {
    const connection = getConnection();

    const read = () =>
      setBrowserStatus({
        online: navigator.onLine,
        slowConnection: hasSlowConnection(connection),
      });

    read();

    const onReconnect = () => {
      resetNetworkHealth();
      read();
    };

    window.addEventListener("online", onReconnect);
    window.addEventListener("offline", read);
    connection?.addEventListener("change", read);

    return () => {
      window.removeEventListener("online", onReconnect);
      window.removeEventListener("offline", read);
      connection?.removeEventListener("change", read);
    };
  }, []);

  const slowRequests = React.useSyncExternalStore(
    subscribeNetworkHealth,
    isNetworkSlow,
    () => false,
  );

  return {
    online: browserStatus.online,
    slow: browserStatus.online && (browserStatus.slowConnection || slowRequests),
  };
}
