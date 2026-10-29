import { afterAll, describe, expect, it } from "vitest";
import type { PoolClient } from "pg";
import {
  CHECK_VIOLATION,
  FK_VIOLATION,
  UNIQUE_VIOLATION,
  closePools,
  expectDbError,
  insert,
  uid,
  validLocation,
  validPin,
  validSource,
  validTodayPin,
  validVideo,
  withRollback,
} from "./helpers";

afterAll(closePools);

async function insertPinPair(client: PoolClient) {
  const past = validPin();
  const today = validTodayPin();
  await insert(client, "pins", past);
  await insert(client, "pins", today);
  return { pastId: String(past.id), todayId: String(today.id) };
}

describe("valid rows are accepted", () => {
  it("accepts a source, pins, location, citation, link, and video", async () => {
    await withRollback(async (client) => {
      const source = validSource();
      await insert(client, "sources", source);
      const { pastId, todayId } = await insertPinPair(client);
      await insert(client, "pin_locations", validLocation(pastId, { is_anchor: true }));
      await insert(client, "pin_sources", {
        pin_id: pastId,
        source_id: source.id,
        role: "record",
      });
      await insert(client, "pin_links", {
        today_pin_id: todayId,
        past_pin_id: pastId,
        interpretation_note: "My interpretation.",
      });
      await insert(client, "videos", validVideo({ pin_id: pastId }));
    });
  });

  it("accepts a complete verified pin and a pin with no end date", async () => {
    await withRollback(async (client) => {
      await insert(
        client,
        "pins",
        validPin({
          status: "verified",
          verified_on: "2026-10-30",
          open_question: null,
          end_date: null,
        }),
      );
    });
  });
});

type ConstraintCase = {
  name: string;
  code: string | string[];
  constraint?: string;
  run: (client: PoolClient) => Promise<unknown>;
};

const constraintCases: ConstraintCase[] = [
  {
    name: "start_date is not the first day of a month",
    code: CHECK_VIOLATION,
    constraint: "pins_start_first_of_month",
    run: (client) => insert(client, "pins", validPin({ start_date: "1975-06-15" })),
  },
  {
    name: "end_date is not the first day of a month",
    code: CHECK_VIOLATION,
    constraint: "pins_end_first_of_month",
    run: (client) => insert(client, "pins", validPin({ end_date: "1976-06-15" })),
  },
  {
    name: "end_date precedes start_date",
    code: CHECK_VIOLATION,
    constraint: "pins_end_after_start",
    run: (client) =>
      insert(
        client,
        "pins",
        validPin({ start_date: "1976-06-01", end_date: "1975-06-01" }),
      ),
  },
  {
    name: "martial-law pin begins before September 1972",
    code: CHECK_VIOLATION,
    constraint: "pins_martial_law_window",
    run: (client) =>
      insert(client, "pins", validPin({ start_date: "1972-08-01", end_date: null })),
  },
  {
    name: "martial-law pin begins after February 1986",
    code: CHECK_VIOLATION,
    constraint: "pins_martial_law_window",
    run: (client) =>
      insert(client, "pins", validPin({ start_date: "1986-03-01", end_date: null })),
  },
  {
    name: "today pin begins before the martial-law period ends",
    code: CHECK_VIOLATION,
    constraint: "pins_today_after_martial_law",
    run: (client) => insert(client, "pins", validTodayPin({ start_date: "1986-02-01" })),
  },
  {
    name: "lead pin has an open question",
    code: CHECK_VIOLATION,
    constraint: "pins_lead_needs_question",
    run: (client) => insert(client, "pins", validPin({ open_question: null })),
  },
  {
    name: "verified pin has verification date, record, and badge",
    code: CHECK_VIOLATION,
    constraint: "pins_verified_complete",
    run: (client) =>
      insert(
        client,
        "pins",
        validPin({ status: "verified", open_question: null, verified_on: null }),
      ),
  },
  {
    name: "primary family is not repeated as a secondary family",
    code: CHECK_VIOLATION,
    constraint: "pins_primary_not_in_secondary",
    run: (client) =>
      insert(client, "pins", validPin({ secondary_families: ["land_reform"] })),
  },
  {
    name: "pin id is a lowercase kebab slug",
    code: CHECK_VIOLATION,
    constraint: "pins_id_slug",
    run: (client) => insert(client, "pins", validPin({ id: "Bad Slug" })),
  },
  {
    name: "source id is a lowercase kebab slug",
    code: CHECK_VIOLATION,
    constraint: "sources_id_slug",
    run: (client) => insert(client, "sources", validSource({ id: "Not_A_Slug" })),
  },
  {
    name: "source URLs require an access date",
    code: CHECK_VIOLATION,
    constraint: "sources_url_needs_accessed",
    run: (client) =>
      insert(
        client,
        "sources",
        validSource({ url: "https://example.com/article", accessed_on: null }),
      ),
  },
  {
    name: "pin has at most one anchor location",
    code: UNIQUE_VIOLATION,
    constraint: "pin_locations_one_anchor",
    run: async (client) => {
      const pin = validPin();
      await insert(client, "pins", pin);
      await insert(client, "pin_locations", validLocation(String(pin.id), { is_anchor: true }));
      return insert(
        client,
        "pin_locations",
        validLocation(String(pin.id), { name: "Cabuyao", is_anchor: true }),
      );
    },
  },
  {
    name: "location latitude is inside the Philippines bounds",
    code: CHECK_VIOLATION,
    constraint: "pin_locations_lat",
    run: async (client) => {
      const pin = validPin();
      await insert(client, "pins", pin);
      return insert(client, "pin_locations", validLocation(String(pin.id), { lat: 40 }));
    },
  },
  {
    name: "today and past pin layers cannot be swapped",
    code: FK_VIOLATION,
    run: async (client) => {
      const { pastId, todayId } = await insertPinPair(client);
      return insert(client, "pin_links", {
        today_pin_id: pastId,
        past_pin_id: todayId,
        interpretation_note: "Swapped on purpose.",
      });
    },
  },
  {
    name: "link today_layer is always today",
    code: CHECK_VIOLATION,
    constraint: "pin_links_today_layer",
    run: async (client) => {
      const { pastId } = await insertPinPair(client);
      return insert(client, "pin_links", {
        today_pin_id: pastId,
        today_layer: "martial_law",
        past_pin_id: pastId,
        interpretation_note: "Wrong layer.",
      });
    },
  },
  {
    name: "a today/past pair is linked at most once",
    code: UNIQUE_VIOLATION,
    constraint: "pin_links_pair_uq",
    run: async (client) => {
      const { pastId, todayId } = await insertPinPair(client);
      const link = {
        today_pin_id: todayId,
        past_pin_id: pastId,
        interpretation_note: "First.",
      };
      await insert(client, "pin_links", link);
      return insert(client, "pin_links", { ...link, interpretation_note: "Second." });
    },
  },
  {
    name: "YouTube id has the expected format",
    code: CHECK_VIOLATION,
    constraint: "videos_youtube_id_format",
    run: (client) => insert(client, "videos", validVideo({ youtube_id: "too-short" })),
  },
  {
    name: "video id is a lowercase kebab slug",
    code: CHECK_VIOLATION,
    constraint: "videos_id_slug",
    run: (client) => insert(client, "videos", validVideo({ id: uid("Video").toUpperCase() })),
  },
];

describe("database constraints", () => {
  it.each(constraintCases)("rejects: $name", async (testCase) => {
    await withRollback(async (client) => {
      await expectDbError(
        testCase.run(client),
        testCase.code,
        testCase.constraint,
      );
    });
  });

  it("prevents deleting a cited source", async () => {
    await withRollback(async (client) => {
      const source = validSource();
      const pin = validPin();
      await insert(client, "sources", source);
      await insert(client, "pins", pin);
      await insert(client, "pin_sources", {
        pin_id: pin.id,
        source_id: source.id,
        role: "record",
      });
      await expectDbError(
        client.query("DELETE FROM sources WHERE id = $1", [source.id]),
        FK_VIOLATION,
      );
    });
  });

  it("cascades pin deletion to its locations", async () => {
    await withRollback(async (client) => {
      const pin = validPin();
      await insert(client, "pins", pin);
      await insert(
        client,
        "pin_locations",
        validLocation(String(pin.id), { is_anchor: true }),
      );
      await client.query("DELETE FROM pins WHERE id = $1", [pin.id]);
      const { rows } = await client.query(
        "SELECT 1 FROM pin_locations WHERE pin_id = $1",
        [pin.id],
      );
      expect(rows).toHaveLength(0);
    });
  });
});
