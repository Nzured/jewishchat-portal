const FINGERPRINT_STORAGE_KEY = "visitorFingerprint";

function createFingerprint(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function getVisitorFingerprint(): string | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const stored = localStorage.getItem(FINGERPRINT_STORAGE_KEY);
    if (stored) return stored;

    const fingerprint = createFingerprint();
    localStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
    return fingerprint;
  } catch {
    return undefined;
  }
}
