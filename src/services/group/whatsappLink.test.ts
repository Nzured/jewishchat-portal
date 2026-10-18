import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const checkWhatsappUrl = vi.fn();

vi.mock("./group.service", () => ({
  GroupService: { checkWhatsappUrl: (...args: unknown[]) => checkWhatsappUrl(...args) },
}));

async function loadModule() {
  vi.resetModules();
  return import("./whatsappLink");
}

const LINK = "https://chat.whatsapp.com/AbC123xyz";
const OTHER = "https://chat.whatsapp.com/Other12345";

describe("checkWhatsappLink", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    checkWhatsappUrl.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces the request by 400ms", async () => {
    checkWhatsappUrl.mockResolvedValue({ errorCode: "AVAILABLE" });
    const { checkWhatsappLink } = await loadModule();

    const promise = checkWhatsappLink(LINK);
    await vi.advanceTimersByTimeAsync(399);
    expect(checkWhatsappUrl).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    await expect(promise).resolves.toEqual({ available: true, message: undefined });
    expect(checkWhatsappUrl).toHaveBeenCalledWith(LINK, undefined);
  });

  it("reports a taken link with the server message", async () => {
    checkWhatsappUrl.mockResolvedValue({ errorCode: "DUPLICATE", message: "Already listed" });
    const { checkWhatsappLink } = await loadModule();

    const promise = checkWhatsappLink(LINK, "draft-1");
    await vi.advanceTimersByTimeAsync(400);

    await expect(promise).resolves.toEqual({ available: false, message: "Already listed" });
    expect(checkWhatsappUrl).toHaveBeenCalledWith(LINK, "draft-1");
  });

  it("shares a pending check for the same link", async () => {
    checkWhatsappUrl.mockResolvedValue({ errorCode: "AVAILABLE" });
    const { checkWhatsappLink } = await loadModule();

    const a = checkWhatsappLink(LINK);
    const b = checkWhatsappLink(LINK);
    expect(b).toBe(a);
    await vi.advanceTimersByTimeAsync(400);
    await Promise.all([a, b]);
    expect(checkWhatsappUrl).toHaveBeenCalledTimes(1);
  });

  it("resolves a superseded check as available without calling the API", async () => {
    checkWhatsappUrl.mockResolvedValue({ errorCode: "AVAILABLE" });
    const { checkWhatsappLink } = await loadModule();

    const first = checkWhatsappLink(LINK);
    const second = checkWhatsappLink(OTHER);

    await expect(first).resolves.toEqual({ available: true });
    await vi.advanceTimersByTimeAsync(400);
    await second;
    expect(checkWhatsappUrl).toHaveBeenCalledTimes(1);
    expect(checkWhatsappUrl).toHaveBeenCalledWith(OTHER, undefined);
  });

  it("treats a network failure without a response as available", async () => {
    checkWhatsappUrl.mockRejectedValue(new Error("Network Error"));
    const { checkWhatsappLink } = await loadModule();

    const promise = checkWhatsappLink(LINK);
    await vi.advanceTimersByTimeAsync(400);
    await expect(promise).resolves.toEqual({ available: true });
  });

  it("reports an error response as unavailable", async () => {
    checkWhatsappUrl.mockRejectedValue({ response: { data: { message: "Listed by someone" } } });
    const { checkWhatsappLink } = await loadModule();

    const promise = checkWhatsappLink(LINK);
    await vi.advanceTimersByTimeAsync(400);
    await expect(promise).resolves.toEqual({ available: false, message: "Listed by someone" });
  });

  it("checks the link again after a failed check instead of reusing the failure", async () => {
    checkWhatsappUrl
      .mockRejectedValueOnce({ response: { data: { message: "Internal server error" } } })
      .mockResolvedValue({ errorCode: "AVAILABLE" });
    const { checkWhatsappLink } = await loadModule();

    const first = checkWhatsappLink(LINK);
    await vi.advanceTimersByTimeAsync(400);
    await expect(first).resolves.toMatchObject({ available: false });

    const second = checkWhatsappLink(LINK);
    await vi.advanceTimersByTimeAsync(400);
    await expect(second).resolves.toMatchObject({ available: true });
    expect(checkWhatsappUrl).toHaveBeenCalledTimes(2);
  });

  it("does not reuse a stale result once the request has settled", async () => {
    checkWhatsappUrl
      .mockResolvedValueOnce({ errorCode: "AVAILABLE" })
      .mockResolvedValue({ errorCode: "DUPLICATE", message: "Already listed" });
    const { checkWhatsappLink } = await loadModule();

    const first = checkWhatsappLink(LINK);
    await vi.advanceTimersByTimeAsync(400);
    await expect(first).resolves.toMatchObject({ available: true });

    const second = checkWhatsappLink(LINK);
    await vi.advanceTimersByTimeAsync(400);
    await expect(second).resolves.toMatchObject({ available: false });
  });
});
