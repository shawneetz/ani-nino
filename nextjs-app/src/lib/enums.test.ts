import { describe, expect, it } from "vitest";
import * as enums from "./enums";
import * as schema from "../db/schema";

describe("chart and methods enum values match the database schema", () => {
  const pairs: [string, readonly string[], readonly string[]][] = [
    ["chart type", enums.CHART_TYPES, schema.chartType.enumValues],
    ["series kind", enums.SERIES_KINDS, schema.seriesKind.enumValues],
    ["qualifier", enums.QUALIFIERS, schema.qualifier.enumValues],
    ["gap kind", enums.GAP_KINDS, schema.gapKind.enumValues],
    ["gap status", enums.GAP_STATUSES, schema.gapStatus.enumValues],
  ];

  it.each(pairs)("%s values are identical", (_name, values, dbValues) => {
    expect([...values]).toEqual([...dbValues]);
  });
});
