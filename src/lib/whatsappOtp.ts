import { RESEND_OTP_COOLDOWN_SECONDS } from "@/configs/const";

const STORAGE_KEY = "whatsappOtpRequest";
const COOLDOWN_MS = RESEND_OTP_COOLDOWN_SECONDS * 1000;

interface WhatsappOtpRequest {
  mobile: string;
  requestedAt: number;
}

function load(): WhatsappOtpRequest | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WhatsappOtpRequest) : null;
  } catch {
    return null;
  }
}

export function markWhatsappOtpRequested(mobile: string) {
  if (typeof window === "undefined") return;
  const entry: WhatsappOtpRequest = { mobile, requestedAt: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function getWhatsappOtpCooldownSeconds(mobile: string): number {
  const entry = load();
  if (!entry || entry.mobile !== mobile) return 0;

  const remainingMs = entry.requestedAt + COOLDOWN_MS - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}
