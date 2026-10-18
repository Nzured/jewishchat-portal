import { describe, expect, it } from "vitest";
import { getActiveHref } from "./nav";

const HREFS = ["/internal", "/internal/users", "/internal/roles", "/internal/groups"];

describe("getActiveHref", () => {
  it("matches an exact path", () => {
    expect(getActiveHref("/internal", HREFS)).toBe("/internal");
  });

  it("prefers the most specific match for nested paths", () => {
    expect(getActiveHref("/internal/users/abc", HREFS)).toBe("/internal/users");
  });

  it("does not match on a shared prefix that is not a path segment", () => {
    expect(getActiveHref("/internal/users-archive", HREFS)).toBe("/internal");
    expect(getActiveHref("/groupsmine", ["/groups"])).toBeUndefined();
  });

  it("returns undefined when nothing matches", () => {
    expect(getActiveHref("/other", HREFS)).toBeUndefined();
  });

  it("only treats the root href as active on the root path", () => {
    expect(getActiveHref("/", ["/", "/groups"])).toBe("/");
    expect(getActiveHref("/groups/x", ["/", "/groups"])).toBe("/groups");
    expect(getActiveHref("/about", ["/", "/groups"])).toBeUndefined();
  });
});
