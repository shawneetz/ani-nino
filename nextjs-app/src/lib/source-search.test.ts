// what this file does: tests the sources page search helper
import { describe, expect, it } from "vitest";
import { matchesSearch } from "./source-search";

describe("matchesSearch", () => {
    it("matches everything when the query is empty", () => {
        expect(matchesSearch(["Anything"], "")).toBe(true);
        expect(matchesSearch(["Anything"], "   ")).toBe(true);
    });

    it("ignores case and accents", () => {
        expect(matchesSearch(["Calamba and Biñan"], "BINAN")).toBe(true);
    });

    it("needs every word, in any order, across fields", () => {
        const fields = ["Removing roadblocks", "The Republic"];
        expect(matchesSearch(fields, "republic roadblocks")).toBe(true);
        expect(matchesSearch(fields, "republic levy")).toBe(false);
    });

    it("skips missing fields", () => {
        expect(matchesSearch([undefined, "Official Gazette"], "gazette")).toBe(true);
    });
});