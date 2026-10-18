import { describe, expect, it } from "vitest";
import { normalizeWhatsappGroupLink, validateWhatsappGroupLink } from "./whatsapp";

describe("normalizeWhatsappGroupLink", () => {
  it.each([
    ["https://chat.whatsapp.com/AbC123xyz", "https://chat.whatsapp.com/AbC123xyz"],
    ["http://chat.whatsapp.com/AbC123xyz", "https://chat.whatsapp.com/AbC123xyz"],
    ["chat.whatsapp.com/AbC123xyz", "https://chat.whatsapp.com/AbC123xyz"],
    ["  https://chat.whatsapp.com/AbC123xyz  ", "https://chat.whatsapp.com/AbC123xyz"],
    ["https://www.chat.whatsapp.com/AbC123xyz", "https://chat.whatsapp.com/AbC123xyz"],
    ["HTTPS://CHAT.WHATSAPP.COM/AbC123xyz", "https://chat.whatsapp.com/AbC123xyz"],
    ["https://chat.whatsapp.com/AbC123xyz/", "https://chat.whatsapp.com/AbC123xyz"],
    ["https://chat.whatsapp.com/AbC123xyz?mode=ac_t", "https://chat.whatsapp.com/AbC123xyz"],
    ["https://chat.whatsapp.com/invite/AbC123xyz", "https://chat.whatsapp.com/AbC123xyz"],
  ])("normalizes %j", (input, expected) => {
    expect(normalizeWhatsappGroupLink(input)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "not a url at all",
    "https://wa.me/972501234567",
    "https://api.whatsapp.com/send?phone=972501234567",
    "https://chat.whatsapp.com/",
    "https://chat.whatsapp.com/abc",
    "https://chat.whatsapp.com.evil.com/AbC123xyz",
    "https://evil.com/chat.whatsapp.com/AbC123xyz",
    "https://chat.whatsapp.com/AbC123xyz/extra",
    "https://chat.whatsapp.com/Ab%20C123xyz",
  ])("rejects %j", (input) => {
    expect(normalizeWhatsappGroupLink(input)).toBeNull();
  });

  it("does not treat the bare /invite path as an invite code", () => {
    expect(normalizeWhatsappGroupLink("https://chat.whatsapp.com/invite")).toBeNull();
    expect(normalizeWhatsappGroupLink("https://chat.whatsapp.com/invite/")).toBeNull();
  });
});

describe("validateWhatsappGroupLink", () => {
  it("accepts valid invite links", () => {
    expect(validateWhatsappGroupLink("https://chat.whatsapp.com/AbC123xyz")).toBe(true);
  });

  it("explains that personal chat links are not group links", () => {
    expect(validateWhatsappGroupLink("https://wa.me/972501234567")).toMatch(/personal chat link/);
    expect(validateWhatsappGroupLink("api.whatsapp.com/send?phone=1")).toMatch(
      /personal chat link/,
    );
  });

  it("explains that the invite code is missing", () => {
    expect(validateWhatsappGroupLink("https://chat.whatsapp.com/")).toMatch(/missing its invite/);
    expect(validateWhatsappGroupLink("https://chat.whatsapp.com/invite")).toMatch(
      /missing its invite/,
    );
  });

  it("falls back to a generic message", () => {
    expect(validateWhatsappGroupLink("https://example.com/group")).toMatch(
      /Enter a WhatsApp group invite link/,
    );
    expect(validateWhatsappGroupLink("")).toMatch(/Enter a WhatsApp group invite link/);
  });
});
