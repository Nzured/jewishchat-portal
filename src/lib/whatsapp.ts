const INVITE_HOST = "chat.whatsapp.com";

/** WhatsApp invite codes are 22 chars today, but older/shorter ones exist — stay lenient on length. */
const INVITE_CODE_REGEX = /^[A-Za-z0-9_-]{6,}$/;

function getHostname(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    // Users often paste without a scheme ("chat.whatsapp.com/AbC123").
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Returns the canonical `https://chat.whatsapp.com/<code>` form of a WhatsApp group invite link,
 * or `null` when the value isn't one. Tolerates a missing scheme, `www.`, the legacy `/invite/`
 * path, tracking query params and trailing slashes.
 */
export function normalizeWhatsappGroupLink(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (url.hostname.toLowerCase().replace(/^www\./, "") !== INVITE_HOST) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const code =
    segments.length === 1
      ? segments[0]
      : segments.length === 2 && segments[0] === "invite"
        ? segments[1]
        : null;

  if (!code || !INVITE_CODE_REGEX.test(code)) {
    return null;
  }

  return `https://${INVITE_HOST}/${code}`;
}

/** react-hook-form `validate` rule: `true` when valid, otherwise the message to show. */
export function validateWhatsappGroupLink(value: string): true | string {
  if (normalizeWhatsappGroupLink(value)) {
    return true;
  }

  const hostname = getHostname(value);

  if (hostname === "wa.me" || hostname === "api.whatsapp.com") {
    return "That's a personal chat link. Open the group, tap Invite via link, and paste that instead.";
  }

  if (hostname === INVITE_HOST) {
    return "That link is missing its invite code — it should look like https://chat.whatsapp.com/AbC123";
  }

  return "Enter a WhatsApp group invite link, e.g. https://chat.whatsapp.com/AbC123";
}
