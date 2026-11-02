import { describe, expect, it } from "vitest";
import { EXTERNAL_GROUPS_MINE_PATH, EXTERNAL_GROUPS_PATH } from "@/configs/const";
import {
  decodeRouteParam,
  getCategoryPath,
  getGroupEditPath,
  getGroupPath,
  getMemberProfileCrumbs,
  getMemberProfilePath,
} from "./publicPaths";

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

describe("getMemberProfilePath", () => {
  const group = {
    name: "Car sellers",
    slug: "car-sellers",
    mainCategory: { slug: "cars", name: "Cars" },
  };

  it("links to the profile alone without an origin group", () => {
    expect(getMemberProfilePath("abc")).toBe("/profile/abc");
  });

  it("carries the origin group in the query", () => {
    const url = new URL(getMemberProfilePath("abc", group), "https://example.test");
    expect(url.pathname).toBe("/profile/abc");
    expect(url.searchParams.get("from")).toBe("/cars/car-sellers");
    expect(url.searchParams.get("group")).toBe("Car sellers");
    expect(url.searchParams.get("category")).toBe("Cars");
  });

  it("skips the origin when the group has no category", () => {
    expect(getMemberProfilePath("abc", { name: "Loose", slug: "loose" })).toBe("/profile/abc");
  });
});

describe("getMemberProfileCrumbs", () => {
  const params = (query: string) => new URLSearchParams(query);

  it("falls back to home and member", () => {
    expect(getMemberProfileCrumbs("Dana", params(""))).toEqual([
      { label: "Home", href: "/" },
      { label: "Dana" },
    ]);
  });

  it("includes the category and group the visitor came from", () => {
    expect(
      getMemberProfileCrumbs(
        "Dana",
        params("from=%2Fcars%2Fcar-sellers&group=Car+sellers&category=Cars"),
      ),
    ).toEqual([
      { label: "Home", href: "/" },
      { label: "Cars", href: "/cars" },
      { label: "Car sellers", href: "/cars/car-sellers" },
      { label: "Dana" },
    ]);
  });

  it("omits the category crumb when no category name is given", () => {
    expect(
      getMemberProfileCrumbs("Dana", params("from=%2Fcars%2Fcar-sellers&group=Car+sellers")),
    ).toEqual([
      { label: "Home", href: "/" },
      { label: "Car sellers", href: "/cars/car-sellers" },
      { label: "Dana" },
    ]);
  });

  it.each(["https://evil.test/x", "//evil.test/x", "/cars", "/a/b/c", "/a\\b/c"])(
    "ignores an unsafe origin %s",
    (from) => {
      const query = new URLSearchParams({ from, group: "Car sellers" });
      expect(getMemberProfileCrumbs("Dana", query)).toEqual([
        { label: "Home", href: "/" },
        { label: "Dana" },
      ]);
    },
  );
});
