import { describe, expect, it } from "vitest";
import { parsePinQuery } from "./pin-query";

const parse = (query: string) => parsePinQuery(new URLSearchParams(query));

describe("parsePinQuery", () => {
  it("provides safe defaults", () => {
    expect(parse("").data).toEqual({
      month: undefined,
      mode: "range",
      families: [],
      provinces: [],
      today: false,
    });
  });

  it("accepts repeated and comma-separated filters", () => {
    expect(parse("family=land_reform&family=labor").data?.families).toEqual([
      "land_reform",
      "labor",
    ]);
    expect(parse("province=laguna,quezon").data?.provinces).toEqual(["laguna", "quezon"]);
  });

  it("maps the existing all-mode API value to cumulative", () => {
    expect(parse("mode=all&month=1975-06").data).toMatchObject({
      month: undefined,
      mode: "cumulative",
    });
  });

  it.each([
    "month=1975-6",
    "month=1972-08",
    "month=1986-03",
    "family=unknown",
    "province=unknown",
    "mode=unknown",
    "today=maybe",
  ])("rejects invalid query %s", (query) => {
    expect(parse(query).success).toBe(false);
  });
});
