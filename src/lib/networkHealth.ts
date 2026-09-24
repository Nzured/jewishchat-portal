const SLOW_REQUEST_MS = 4000;
const SLOW_WINDOW_MS = 20000;

let slowUntil = 0;
let clearTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function markSlow() {
  slowUntil = Date.now() + SLOW_WINDOW_MS;
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    clearTimer = null;
    emit();
  }, SLOW_WINDOW_MS);
  emit();
}

export function reportRequestDuration(ms: number) {
  if (ms >= SLOW_REQUEST_MS) markSlow();
}
export function reportRequestTimeout() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  markSlow();
}

export function resetNetworkHealth() {
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = null;
  slowUntil = 0;
  emit();
}

export function isNetworkSlow() {
  return Date.now() < slowUntil;
}

export function subscribeNetworkHealth(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
