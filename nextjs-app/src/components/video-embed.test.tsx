// @vitest-environment jsdom
// What this file does: checks that no iframe exists before the click,
// that the credit line is always visible, and that the iframe uses the no-cookie domain.
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { VideoEmbed } from "./video-embed";

afterEach(cleanup);

const video = {
  id: "test-video",
  pinId: "test-pin",
  youtubeId: "dQw4w9WgXcQ",
  title: "Test video",
  channel: "Test channel",
  creditLine: "Credit: Test channel",
  startSeconds: null,
  sortOrder: 0,
  url: null,
  note: null,
};

describe("VideoEmbed", () => {
  it("loads no iframe until the reader clicks, and always shows the credit", () => {
    const { container } = render(<VideoEmbed video={video} />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByText("Credit: Test channel")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /play video/i }));
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(screen.getByText("Credit: Test channel")).toBeTruthy();
  });
});
