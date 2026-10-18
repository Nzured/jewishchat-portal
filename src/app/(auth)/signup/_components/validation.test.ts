import { describe, expect, it } from "vitest";
import { EMAIL_REGEX } from "@/configs/const";
import { mobileRules, passwordRules } from "./validation";

const validatePassword = passwordRules.validate as (value: string) => true | string;

describe("password rules", () => {
  it("accepts a password meeting every requirement", () => {
    expect(validatePassword("Shalom123!")).toBe(true);
  });

  it.each([
    ["too short", "Sh1!"],
    ["no uppercase", "shalom123!"],
    ["no lowercase", "SHALOM123!"],
    ["no number", "Shalomabc!"],
    ["no special character", "Shalom1234"],
    ["only a space as special character", "Shalom 1234"],
  ])("rejects a password with %s", (_label, value) => {
    expect(validatePassword(value)).toBe("Password does not meet all requirements");
  });
});

describe("mobile rules", () => {
  it("allows an empty mobile number", () => {
    expect(mobileRules.validate("")).toBe(true);
  });

  it("accepts a valid international number", () => {
    expect(mobileRules.validate("+972501234567")).toBe(true);
  });

  it("rejects an invalid number", () => {
    expect(mobileRules.validate("+97250")).toMatch(/valid phone number/);
  });
});

describe("email regex", () => {
  it.each(["a@b.co", "first.last+tag@example.org"])("accepts %j", (value) => {
    expect(EMAIL_REGEX.test(value)).toBe(true);
  });

  it.each(["", "plain", "a@b", "a b@c.com", "a@b c.com"])("rejects %j", (value) => {
    expect(EMAIL_REGEX.test(value)).toBe(false);
  });
});
