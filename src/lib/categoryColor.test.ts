import { describe, expect, it } from "vitest";
import {
  CATEGORY_COLOR_STYLES,
  categoryColorClasses,
  fallbackCategoryColor,
} from "./categoryColor";

describe("fallbackCategoryColor", () => {
  it("is deterministic for the same seed", () => {
    expect(fallbackCategoryColor("utensils")).toBe(fallbackCategoryColor("utensils"));
  });

  it("always returns a known color", () => {
    for (const seed of ["", "a", "utensils", "בית כנסת", "x".repeat(500)]) {
      expect(Object.keys(CATEGORY_COLOR_STYLES)).toContain(fallbackCategoryColor(seed));
    }
  });

  it("spreads different seeds across several colors", () => {
    const seeds = ["food", "business", "travel", "events", "jobs", "torah", "news", "kids"];
    expect(new Set(seeds.map(fallbackCategoryColor)).size).toBeGreaterThan(2);
  });
});

describe("categoryColorClasses", () => {
  it("uses the explicit color when given", () => {
    expect(categoryColorClasses("rose", "anything")).toBe(CATEGORY_COLOR_STYLES.rose);
  });

  it("falls back to the seed-derived color", () => {
    expect(categoryColorClasses(undefined, "food")).toBe(
      CATEGORY_COLOR_STYLES[fallbackCategoryColor("food")],
    );
  });
});
