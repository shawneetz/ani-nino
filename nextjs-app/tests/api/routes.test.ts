import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  chartsResponseSchema,
  errorResponseSchema,
  methodsSchema,
  pinsResponseSchema,
} from "../../src/lib/api-schemas";

const queryMocks = vi.hoisted(() => ({
  getPins: vi.fn(),
  getPin: vi.fn(),
  getCharts: vi.fn(),
  getMethods: vi.fn(),
}));

vi.mock("@/db/queries", () => queryMocks);

import { GET as getCharts } from "../../app/api/charts/route";
import { GET as getMethods } from "../../app/api/methods/route";
import { GET as getPin } from "../../app/api/pins/[slug]/route";
import { GET as getPins } from "../../app/api/pins/route";

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.getPins.mockResolvedValue([]);
  queryMocks.getPin.mockResolvedValue(null);
  queryMocks.getCharts.mockResolvedValue([]);
  queryMocks.getMethods.mockResolvedValue({
    sourcesByKind: [],
    gaps: [],
    leadPins: [],
    counts: { pins: 0, sources: 0, byBadge: {}, byStatus: {} },
  });
});

describe("API route contracts", () => {
  it("returns filtered pins with the normalized filter state", async () => {
    const response = await getPins(
      new Request("http://test/api/pins?month=1975-06&family=land_reform&today=1"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=60");
    const body = pinsResponseSchema.parse(await response.json());
    expect(body).toMatchObject({
      count: 0,
      filters: {
        month: "1975-06",
        mode: "range",
        families: ["land_reform"],
        today: true,
      },
      pins: [],
    });
  });

  it("rejects malformed filters without querying data", async () => {
    const response = await getPins(new Request("http://test/api/pins?month=1975-6"));
    expect(response.status).toBe(400);
    expect(errorResponseSchema.parse(await response.json()).error).toBe("invalid_query");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(queryMocks.getPins).not.toHaveBeenCalled();
  });

  it("returns not-found for absent details and valid chart/method contracts", async () => {
    const detail = await getPin(new Request("http://test/api/pins/missing"), {
      params: Promise.resolve({ slug: "missing" }),
    });
    expect(detail.status).toBe(404);
    expect(errorResponseSchema.parse(await detail.json()).error).toBe("not_found");

    expect(chartsResponseSchema.parse(await (await getCharts()).json())).toEqual({ charts: [] });
    expect(methodsSchema.parse(await (await getMethods()).json()).counts.pins).toBe(0);
  });
});
