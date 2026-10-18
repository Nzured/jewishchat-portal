import { describe, expect, it } from "vitest";
import { formatCityRegion, formatLocation } from "./location";

const full = {
  locationCity: "Brooklyn",
  locationState: "New York",
  locationCountry: "United States",
};

describe("formatLocation", () => {
  it("joins all parts by default", () => {
    expect(formatLocation(full)).toBe("Brooklyn, New York, United States");
  });

  it("only includes requested parts, in the requested order", () => {
    expect(formatLocation(full, ["country", "city"])).toBe("United States, Brooklyn");
  });

  it("skips empty, null and undefined parts", () => {
    expect(
      formatLocation({ locationCity: "", locationState: null, locationCountry: "Israel" }),
    ).toBe("Israel");
    expect(formatLocation({})).toBe("");
  });
});

describe("formatCityRegion", () => {
  it("shows city and state", () => {
    expect(formatCityRegion(full)).toBe("Brooklyn, New York");
  });

  it("falls back to country when there is no state", () => {
    expect(formatCityRegion({ locationCity: "Haifa", locationCountry: "Israel" })).toBe(
      "Haifa, Israel",
    );
  });

  it("shows only the region when there is no city", () => {
    expect(formatCityRegion({ locationState: "", locationCountry: "Israel" })).toBe("Israel");
  });
});
