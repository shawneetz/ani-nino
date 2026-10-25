// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PinDetailPanel } from "./pin-detail-panel";
import { yuloEvictions, yuloExemption } from "./__fixtures__/pins";

afterEach(cleanup);

function setup(pin = yuloExemption) {
  const onClose = vi.fn();
  const onSelectLinked = vi.fn();
  render(<PinDetailPanel pin={pin} onClose={onClose} onSelectLinked={onSelectLinked} />);
  return { onClose, onSelectLinked };
}

describe("PinDetailPanel", () => {
  it("shows an open question for a lead and a verification date for a verified pin", () => {
    setup();
    expect(screen.getByText(/lead, not yet verified/i)).toBeTruthy();
    expect(screen.getByText(/Find the exemption date and legal basis/)).toBeTruthy();
    cleanup();
    setup(yuloEvictions);
    expect(screen.getByText(/Verified on Oct 24, 2026/)).toBeTruthy();
    expect(screen.queryByText(/lead, not yet verified/i)).toBeNull();
  });

  it("groups sources under the claim they support", () => {
    setup();
    const promise = screen.getByRole("region", { name: /what it promised/i });
    const record = screen.getByRole("region", { name: /what the record shows/i });
    expect(within(promise).getByText("Presidential Decree No. 27")).toBeTruthy();
    expect(within(promise).queryByText("Hacienda Yulo report")).toBeNull();
    expect(within(record).getByText("Hacienda Yulo report")).toBeTruthy();
    expect(within(record).queryByText("Presidential Decree No. 27")).toBeNull();
  });

  it("shows safe source links, citations, timeline, and approximate locations", () => {
    setup();
    expect(screen.getByText(/Cite: Sec\. 2/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /archived copy/i })).toBeTruthy();
    expect(screen.getByText("Oct 3, 1973")).toBeTruthy();
    expect(screen.getByText(/\(approximate area\)/)).toBeTruthy();
    const link = screen.getByRole("link", { name: "Presidential Decree No. 27" });
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("labels linked pins as interpretation and selects them", () => {
    const { onSelectLinked } = setup();
    expect(screen.getByText(/my interpretation/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Hacienda Yulo evictions/ }));
    expect(onSelectLinked).toHaveBeenCalledWith("laguna-hacienda-yulo-evictions");
  });

  it("focuses the panel title and closes with the button or Escape", () => {
    const { onClose } = setup();
    const heading = screen.getByRole("heading", { level: 2, name: /Hacienda Yulo exempted/ });
    expect(document.activeElement).toBe(heading);
    fireEvent.click(screen.getByRole("button", { name: /close details/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
