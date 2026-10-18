import { describe, expect, it } from "vitest";
import { cn, formatFileSize, slugify } from "./utils";

describe("cn", () => {
  it("merges conflicting tailwind classes, keeping the last one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });
});

describe("slugify", () => {
  it.each([
    ["Hello World", "hello-world"],
    ["  Trim  me  ", "trim-me"],
    ["Kosher Food & Recipes!", "kosher-food-recipes"],
    ["--already--dashed--", "already-dashed"],
    ["Tel Aviv 2026", "tel-aviv-2026"],
    ["", ""],
    ["בית כנסת", "בית-כנסת"],
    ["שַׁבָּת שָׁלוֹם", "שבת-שלום"],
    ["Kosher בישול", "kosher-בישול"],
    ["Café Crème", "cafe-creme"],
    ["!!!", ""],
  ])("slugify(%j) -> %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("formatFileSize", () => {
  it("shows kilobytes below one megabyte", () => {
    expect(formatFileSize(820 * 1024)).toBe("820 KB");
  });

  it("shows megabytes with one decimal at or above one megabyte", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatFileSize(1.45 * 1024 * 1024)).toBe("1.4 MB");
  });

  it("never shows less than 1 KB for tiny non-empty files", () => {
    expect(formatFileSize(10)).toBe("1 KB");
  });

  it("does not render 1024 KB just below the megabyte boundary", () => {
    expect(formatFileSize(1024 * 1024 - 1)).toBe("1.0 MB");
  });
});
