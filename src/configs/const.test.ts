import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESERVED_ROUTE_SLUGS } from "./const";

const APP_DIR = path.resolve(__dirname, "../app");

function topLevelRouteSegments(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      if (/^\(.*\)$/.test(entry.name)) return topLevelRouteSegments(path.join(dir, entry.name));
      if (entry.name.startsWith("[") || entry.name.startsWith("_")) return [];
      return [entry.name];
    });
}

describe("RESERVED_ROUTE_SLUGS", () => {
  it("reserves every top-level route so a category slug can never shadow it", () => {
    const missing = topLevelRouteSegments(APP_DIR).filter(
      (segment) => !RESERVED_ROUTE_SLUGS.includes(segment),
    );
    expect(missing).toEqual([]);
  });
});
