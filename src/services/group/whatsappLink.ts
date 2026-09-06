import { GroupService } from "./group.service";

export interface WhatsappLinkAvailability {
  available: boolean;
  message?: string;
}

const AVAILABLE_CODE = "AVAILABLE";
const CHECK_DEBOUNCE_MS = 400;

const inFlight = new Map<string, Promise<WhatsappLinkAvailability>>();

interface CheckError {
  response?: { data?: { message?: string; errorCode?: string } };
}

interface PendingCheck {
  key: string;
  promise: Promise<WhatsappLinkAvailability>;
  supersede: () => void;
}

let pending: PendingCheck | null = null;

function sendCheck(
  url: string,
  excludeDraftId: string | undefined,
  key: string,
): Promise<WhatsappLinkAvailability> {
  const request = GroupService.checkWhatsappUrl(url, excludeDraftId)
    .then((res) => ({
      available: res?.errorCode === AVAILABLE_CODE,
      message: res?.message,
    }))
    .catch((error: CheckError) => {
      const data = error?.response?.data;
      if (!data) return { available: true };
      return { available: false, message: data.message };
    });

  inFlight.set(key, request);
  return request;
}

export function checkWhatsappLink(
  url: string,
  excludeDraftId?: string,
): Promise<WhatsappLinkAvailability> {
  const key = `${url}|${excludeDraftId ?? ""}`;

  const cached = inFlight.get(key);
  if (cached) return cached;

  if (pending?.key === key) return pending.promise;
  pending?.supersede();

  let settle!: (value: WhatsappLinkAvailability | PromiseLike<WhatsappLinkAvailability>) => void;
  const promise = new Promise<WhatsappLinkAvailability>((resolve) => {
    settle = resolve;
  });

  const timer = setTimeout(() => {
    pending = null;
    settle(sendCheck(url, excludeDraftId, key));
  }, CHECK_DEBOUNCE_MS);

  pending = {
    key,
    promise,
    supersede: () => {
      clearTimeout(timer);
      pending = null;
      settle({ available: true });
    },
  };

  return promise;
}
