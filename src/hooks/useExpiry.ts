"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_DATE_FORMAT, formatDate, formatDuration } from "@/lib/date";

const DEFAULT_REFRESH_MS = 60_000;
const DEFAULT_URGENT_WITHIN_MS = 60 * 60 * 1000;

interface ExpirySource {
  expiresAt?: string | null;
  expiresInSeconds?: number | null;
}

interface UseExpiryOptions {
  refreshMs?: number;
  urgentWithinMs?: number;
}

export interface ExpiryState {
  deadline: number;
  remainingMs: number;
  expired: boolean;
  urgent: boolean;
  label: string;
  exactLabel?: string;
}

export function useExpiry(
  { expiresAt, expiresInSeconds }: ExpirySource,
  {
    refreshMs = DEFAULT_REFRESH_MS,
    urgentWithinMs = DEFAULT_URGENT_WITHIN_MS,
  }: UseExpiryOptions = {},
): ExpiryState | null {
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(mountedAt);

  const deadline = useMemo(() => {
    if (expiresAt) {
      const parsed = new Date(expiresAt).getTime();
      if (!Number.isNaN(parsed)) return parsed;
    }
    if (typeof expiresInSeconds === "number") return mountedAt + expiresInSeconds * 1000;
    return null;
  }, [expiresAt, expiresInSeconds, mountedAt]);

  useEffect(() => {
    if (deadline == null) return;
    const interval = setInterval(() => setNow(Date.now()), refreshMs);
    return () => clearInterval(interval);
  }, [deadline, refreshMs]);

  if (deadline == null) return null;

  const remainingMs = deadline - now;
  const expired = remainingMs <= 0;

  return {
    deadline,
    remainingMs,
    expired,
    urgent: remainingMs <= urgentWithinMs,
    label: expired ? "expired" : `expires in ${formatDuration(remainingMs)}`,
    exactLabel: expiresAt ? formatDate(expiresAt, `${DEFAULT_DATE_FORMAT}, h:mm A`) : undefined,
  };
}
