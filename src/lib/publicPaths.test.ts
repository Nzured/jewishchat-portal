import { describe, expect, it } from "vitest";
import { EXTERNAL_GROUPS_MINE_PATH, EXTERNAL_GROUPS_PATH } from "@/configs/const";
import { decodeRouteParam, getCategoryPath, getGroupEditPath, getGroupPath } from "./publicPaths";

describe("decodeRouteParam", () => {
  it("decodes percent-encoded Hebrew", () => {
    expect(decodeRouteParam(encodeURIComponent("בית-כנסת"))).toBe("בית-כנסת");
  });

  it("leaves already-decoded values alone", () => {
    expect(decodeRouteParam("בית-כנסת")).toBe("בית-כנסת");
    expect(decodeRouteParam("kosher-food")).toBe("kosher-food");
  });

  it("returns malformed input unchanged instead of throwing", () => {
    expect(decodeRouteParam("%E0%A4%A")).toBe("%E0%A4%A");
  });

  it("round-trips with getCategoryPath", () => {
    const slug = "בית-כנסת";
    expect(decodeRouteParam(getCategoryPath(slug).slice(1))).toBe(slug);
  });
});

describe("getCategoryPath", () => {
  it("prefixes the slug with a slash", () => {
    expect(getCategoryPath("food")).toBe("/food");
  });

  it("encodes unsafe characters", () => {
    expect(getCategoryPath("a b/c")).toBe("/a%20b%2Fc");
  });
});

describe("getGroupPath", () => {
  it("prefers the nested main category slug", () => {
    expect(
      getGroupPath({ slug: "g", mainCategory: { slug: "food" }, mainCategorySlug: "other" }),
    ).toBe("/food/g");
  });

  it("falls back to the flat main category slug", () => {
    expect(getGroupPath({ slug: "g", mainCategory: null, mainCategorySlug: "food" })).toBe(
      "/food/g",
    );
  });

  it("falls back to the groups listing without a category", () => {
    expect(getGroupPath({ slug: "g" })).toBe(EXTERNAL_GROUPS_PATH);
  });

  it("encodes both segments", () => {
    expect(getGroupPath({ slug: "a b", mainCategorySlug: "c&d" })).toBe("/c%26d/a%20b");
  });
});

describe("getGroupEditPath", () => {
  it("builds the edit path under my groups", () => {
    expect(getGroupEditPath({ slug: "g", mainCategory: { slug: "food" } })).toBe(
      `${EXTERNAL_GROUPS_MINE_PATH}/food/g`,
    );
  });

  it("falls back to my groups without a category", () => {
    expect(getGroupEditPath({ slug: "g" })).toBe(EXTERNAL_GROUPS_MINE_PATH);
  });
});
