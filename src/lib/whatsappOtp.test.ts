import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RESEND_OTP_COOLDOWN_SECONDS } from "@/configs/const";
import { getWhatsappOtpCooldownSeconds, markWhatsappOtpRequested } from "./whatsappOtp";

describe("whatsapp OTP cooldown", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("has no cooldown before any request", () => {
    expect(getWhatsappOtpCooldownSeconds("+972501234567")).toBe(0);
  });

  it("starts the full cooldown right after a request", () => {
    markWhatsappOtpRequested("+972501234567");
    expect(getWhatsappOtpCooldownSeconds("+972501234567")).toBe(RESEND_OTP_COOLDOWN_SECONDS);
  });

  it("counts down and rounds partial seconds up", () => {
    markWhatsappOtpRequested("+972501234567");
    vi.advanceTimersByTime(10_500);
    expect(getWhatsappOtpCooldownSeconds("+972501234567")).toBe(RESEND_OTP_COOLDOWN_SECONDS - 10);
  });

  it("ends once the cooldown elapses", () => {
    markWhatsappOtpRequested("+972501234567");
    vi.advanceTimersByTime(RESEND_OTP_COOLDOWN_SECONDS * 1000);
    expect(getWhatsappOtpCooldownSeconds("+972501234567")).toBe(0);
  });

  it("does not apply the cooldown to a different number", () => {
    markWhatsappOtpRequested("+972501234567");
    expect(getWhatsappOtpCooldownSeconds("+12025550123")).toBe(0);
  });

  it("ignores corrupt storage", () => {
    sessionStorage.setItem("whatsappOtpRequest", "{not json");
    expect(getWhatsappOtpCooldownSeconds("+972501234567")).toBe(0);
  });

  it("does not throw when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    expect(() => markWhatsappOtpRequested("+972501234567")).not.toThrow();
  });
});
