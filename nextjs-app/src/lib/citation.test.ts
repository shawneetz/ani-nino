// what this file does: tests the citation line for confirmed and checking programs
import { describe, expect, it } from "vitest";
import { citationText } from "./citation";

const SITE_URL = "https://anino.example.org";

describe("citationText", () => {
  it("cites a confirmed program with its checked date", () => {
    expect(
      citationText(
        { slug: "laguna-operation-land-transfer", title: "Operation Land Transfer in Laguna", status: "confirmed", checkedOn: "2026-11-25" },
        SITE_URL,
      ),
    ).toBe(
      'Anino ng Ani. "Operation Land Transfer in Laguna." Confirmed, checked 2026-11-25. https://anino.example.org/programs/laguna-operation-land-transfer',
    );
  });

  it("says a checking program is still being checked and shows no date", () => {
    const text = citationText({ slug: "quezon-coconut-levy", title: "The coconut levy in Quezon", status: "checking" }, SITE_URL);
    expect(text).toContain("Still being checked.");
    expect(text).not.toContain("Confirmed");
    expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it("does not double the full stop or the slash", () => {
    const text = citationText({ slug: "a", title: "A title.", status: "checking" }, `${SITE_URL}/`);
    expect(text).toContain('"A title."');
    expect(text).toContain("https://anino.example.org/programs/a");
    expect(text).not.toContain("..");
    expect(text).not.toContain("org//");
  });

  it("still reads well when a confirmed program has no date", () => {
    expect(citationText({ slug: "a", title: "A", status: "confirmed" }, SITE_URL)).toContain("Confirmed. https://");
  });
});
