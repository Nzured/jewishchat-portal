"use client";

import * as React from "react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const OFFLINE_TOAST_ID = "network-offline";
const SLOW_TOAST_ID = "network-slow";

export function NetworkStatusWatcher() {
  const { online, slow } = useNetworkStatus();

  React.useEffect(() => {
    if (!online) {
      toast.dismiss(SLOW_TOAST_ID);
      toast.error("You're offline", {
        id: OFFLINE_TOAST_ID,
        description: "We'll keep trying - check your connection.",
        duration: Infinity,
      });
      return;
    }

    toast.dismiss(OFFLINE_TOAST_ID);

    if (slow) {
      toast.warning("Your connection is slow", {
        id: SLOW_TOAST_ID,
        description: "Images and data may take longer than usual to load.",
        duration: Infinity,
      });
      return;
    }

    toast.dismiss(SLOW_TOAST_ID);
  }, [online, slow]);

  return null;
}
