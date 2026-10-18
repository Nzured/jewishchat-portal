import { describe, expect, it } from "vitest";
import { NOT_APPLICABLE } from "../const";
import { dashRemover, singularize, wordFormatter } from "./WordFormatter";

describe("wordFormatter", () => {
  it.each([
    ["PENDING_REVIEW", "Pending Review"],
    ["active", "Active"],
    ["can_manage_categories", "Can Manage Categories"],
    ["LAST_7_DAYS", "Last 7 Days"],
    ["SUPER_ADMIN", "Super Admin"],
    ["admin", "Admin"],
    ["kosher food", "Kosher food"],
  ])("wordFormatter(%j) -> %j", (input, expected) => {
    expect(wordFormatter(input)).toBe(expected);
  });

  it.each(["Kosher Food", "Content Moderator", "Violated WhatsApp policy", "NYC Jewish Singles"])(
    "leaves human-written text %j unchanged",
    (input) => {
      expect(wordFormatter(input)).toBe(input);
    },
  );

  it.each([null, undefined, ""])("returns N/A for %j", (input) => {
    expect(wordFormatter(input)).toBe(NOT_APPLICABLE);
  });
});

describe("dashRemover", () => {
  it("replaces underscores with spaces without changing case", () => {
    expect(dashRemover("SPAM_OR_SCAM")).toBe("SPAM OR SCAM");
  });

  it.each([null, undefined, ""])("returns N/A for %j", (input) => {
    expect(dashRemover(input)).toBe(NOT_APPLICABLE);
  });
});

describe("singularize", () => {
  it.each([
    ["Categories", "Category"],
    ["Roles", "Role"],
    ["records", "record"],
    ["Groups", "Group"],
    ["Data", "Data"],
  ])("singularize(%j) -> %j", (input, expected) => {
    expect(singularize(input)).toBe(expected);
  });
});
